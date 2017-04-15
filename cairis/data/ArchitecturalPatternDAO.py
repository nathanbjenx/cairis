#  Licensed to the Apache Software Foundation (ASF) under one
#  or more contributor license agreements.  See the NOTICE file
#  distributed with this work for additional information
#  regarding copyright ownership.  The ASF licenses this file
#  to you under the Apache License, Version 2.0 (the
#  "License"); you may not use this file except in compliance
#  with the License.  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing,
#  software distributed under the License is distributed on an
#  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
#  specific language governing permissions and limitations
#  under the License.

from cairis.core.ARM import *
from cairis.daemon.CairisHTTPError import ObjectNotFoundHTTPError, ARMHTTPError, MalformedJSONHTTPError, MissingParameterHTTPError, SilentHTTPError
from cairis.data.CairisDAO import CairisDAO
from cairis.tools.JsonConverter import json_deserialize
from cairis.tools.ModelDefinitions import ArchitecturalPatternModel,ComponentModel,ConnectorModel,InterfaceModel,ComponentGoalAssociationModel,ComponentStructureModel
from cairis.tools.SessionValidator import check_required_keys, get_fonts
from cairis.core.ComponentParameters import ComponentParameters
from cairis.core.ConnectorParameters import ConnectorParameters
from cairis.core.ComponentViewParameters import ComponentViewParameters
from cairis.misc.AssetModel import AssetModel as GraphicalAssetModel
from cairis.misc.ComponentModel import ComponentModel as GraphicalComponentModel
from cairis.misc.KaosModel import KaosModel

__author__ = 'Shamal Faily'


class ArchitecturalPatternDAO(CairisDAO):
  def __init__(self, session_id):
    CairisDAO.__init__(self, session_id)

  def get_architectural_patterns(self):
    try:
      cvs = self.db_proxy.getComponentViews()
      return self.realToFakeAPs(cvs)
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def get_architectural_pattern(self,name):
    try:
      cvId = self.db_proxy.getDimensionId(name,'component_view')
      cv = self.db_proxy.getComponentViews(cvId)
      return self.realToFakeAP(cv[name])
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def delete_architectural_pattern(self,name):
    try:
      cvId = self.db_proxy.getDimensionId(name,'component_view')
      self.db_proxy.deleteComponentView(cvId)
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def realToFakeAPs(self,cvs):
    fakeAPs = []
    for cvKey in cvs:
      fakeAPs.append(self.realToFakeAP(cvs[cvKey]))
    return fakeAPs

  def realToFakeAP(self,cv):
    ap = {}
    ap['theName'] = cv.name()
    ap['theSynopsis'] = cv.synopsis()
    ap['theComponents'] = []
    for co in cv.components():
      fComp = {}
      fComp['theName'] = co.name()
      fComp['theDescription'] = co.description()
      fComp['theInterfaces'] = []
      for ci in co.interfaces():
        fci = {}
        fci['theName'] = ci[0]
        fci['theType'] = ci[1]
        fci['theAccessRight'] = ci[2]
        fci['thePrivilege'] = ci[3]
        fComp['theInterfaces'].append(fci)
      fComp['theStructure'] = []
      for cs in co.structure():
        fcs = {}
        fcs['theHeadAsset'] = cs[0]
        fcs['theHeadAdornment'] = cs[1]
        fcs['theHeadNav'] = cs[2]
        fcs['theHeadNry'] = cs[3]
        fcs['theHeadRole'] = cs[4]
        fcs['theTailRole'] = cs[5]
        fcs['theTailNry'] = cs[6]
        fcs['theTailNav'] = cs[7]
        fcs['theTailAdornment'] = cs[8]
        fcs['theTailAsset'] = cs[9]
        fComp['theStructure'].append(fcs)
      fComp['theRequirements'] = co.requirements()
      fComp['theGoals'] = co.goals()
      fComp['theGoalAssociations'] = []
      for cga in co.associations():
        fcga = {}
        fcga['theGoalName'] = cga[0] 
        fcga['theRefType'] = cga[1] 
        fcga['theSubGoalName'] = cga[2] 
        fcga['theRationale'] = cga[3] 
        fComp['theGoalAssociations'].append(fcga) 
      ap['theComponents'].append(fComp)
    ap['theConnectors'] = []
    for cn in cv.connectors():
      fConn = {} 
      fConn['theConnectorName'] = cn[0]
      fConn['theFromComponent'] = cn[1]
      fConn['theFromRole'] = cn[2]
      fConn['theFromInterface'] = cn[3]
      fConn['theToComponent'] = cn[4]
      fConn['theToInterface'] = cn[5]
      fConn['theToRole'] = cn[6]
      fConn['theAssetName'] = cn[7]
      fConn['theProtocol'] = cn[8]
      fConn['theAccessRight'] = cn[9]
      ap['theConnectors'].append(fConn)
    ap['theAttackSurfaceMetric'] = list(cv.attackSurfaceMetric())
    return ap

  def add_architectural_pattern(self,ap):
    cvParams = self.fakeToRealAp(ap)
    try:
      if not self.check_existing_architectural_pattern(cvParams.name()):
        self.db_proxy.addComponentView(cvParams)
      else:
        self.close()
        raise OverwriteNotAllowedHTTPError(obj_name=cvParams.name())
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def update_architectural_pattern(self,ap,name):
    try:
      cvId = self.db_proxy.getDimensionId(name,'component_view')
      cvParams = self.fakeToRealAp(ap)
      cvParams.setId(cvId)
      self.db_proxy.updateComponentView(cvParams)
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def check_existing_architectural_pattern(self,cvName):
    try:
      self.db_proxy.nameCheck(cvName, 'component_view')
      return False
    except DatabaseProxyException as ex:
      if str(ex.value).find('already exists') > -1:
        return True
        self.close()
        raise ARMHTTPError(ex)
    except ARMException as ex:
      if str(ex.value).find('already exists') > -1:
        return True
        self.close()
        raise ARMHTTPError(ex)

  def fakeToRealAp(self,ap):
    apName = ap["theName"]
    apSyn = ap["theSynopsis"]
    theComponents = []
    for c in ap["theComponents"]:
      cName = c["theName"]
      cDesc = c["theDescription"]
      cInts = []
      for i in c["theInterfaces"]:
        cInts.append((i["theName"],i["theType"],i["theAccessRight"],i["thePrivilege"]))
      cStructs = []
      for cs in c["theStructure"]:
        cStructs.append((cs["theHeadAsset"],cs["theHeadAdornment"],cs["theHeadNav"],cs["theHeadNry"],cs["theHeadRole"],cs["theTailRole"],cs["theTailNry"],cs["theTailNav"],cs["theTailAdornment"],cs["theTailAsset"]))
      cReqs = []
      cGoals = []
      for i in c["theGoals"]:
        cGoals.append(i)

      cGoalAssocs = []
      for cga in c["theGoalAssociations"]:
        cGoalAssocs.append((cga["theGoalName"],cga["theSubGoalName"],cga["theRefType"],'None'))
      theComponents.append(ComponentParameters(cName,cDesc,cInts,cStructs,cReqs,cGoals,cGoalAssocs))
    theConnectors = []
    for conn in ap["theConnectors"]:
      theConnectors.append(ConnectorParameters(conn["theConnectorName"],apName,conn["theFromComponent"],conn["theFromRole"],conn["theFromInterface"],conn["theToComponent"],conn["theToInterface"],conn["theToRole"],conn["theAssetName"],conn["theProtocol"],conn["theAccessRight"]))

    cvParams = ComponentViewParameters(apName,apSyn,[],[],[],[],[],theComponents,theConnectors)
    return cvParams

  def get_component_asset_model(self,cName):
    fontName, fontSize, apFontName = get_fonts(session_id=self.session_id)
    try:
      associationDictionary = self.db_proxy.componentAssetModel(cName)
      associations = GraphicalAssetModel(associationDictionary.values(), db_proxy=self.db_proxy, fontName=fontName, fontSize=fontSize)
      dot_code = associations.graph()
      return dot_code
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except Exception as ex:
      print(ex)

  def get_component_goal_model(self,cName):
    fontName, fontSize, apFontName = get_fonts(session_id=self.session_id)
    try:
      associationDictionary = self.db_proxy.componentGoalModel(cName)
      associations = KaosModel(associationDictionary.values(), '',kaosModelType='template_goal',db_proxy=self.db_proxy, font_name=fontName, font_size=fontSize)
      dot_code = associations.graph()
      return dot_code
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except Exception as ex:
      print(ex)

  def get_component_model(self,cvName):
    fontName, fontSize, apFontName = get_fonts(session_id=self.session_id)
    try:
      interfaces,connectors = self.db_proxy.componentView(cvName)
      associations = GraphicalComponentModel(interfaces,connectors,db_proxy=self.db_proxy, font_name=fontName, font_size=fontSize)
      dot_code = associations.graph()
      return dot_code
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except Exception as ex:
      print(ex)
