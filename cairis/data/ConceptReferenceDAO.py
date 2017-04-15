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
from cairis.core.ConceptReference import ConceptReference
from cairis.core.ConceptReferenceParameters import ConceptReferenceParameters
from cairis.daemon.CairisHTTPError import ObjectNotFoundHTTPError, MalformedJSONHTTPError, ARMHTTPError, MissingParameterHTTPError, OverwriteNotAllowedHTTPError
import cairis.core.armid
from cairis.data.CairisDAO import CairisDAO
from cairis.tools.ModelDefinitions import ConceptReferenceModel
from cairis.tools.SessionValidator import check_required_keys
from cairis.tools.JsonConverter import json_serialize, json_deserialize

__author__ = 'Shamal Faily'


class ConceptReferenceDAO(CairisDAO):
  def __init__(self, session_id):
    CairisDAO.__init__(self, session_id)

  def get_concept_references(self,constraint_id = -1):
    """
    :rtype: dict[str,ConceptReference]
    :return
    :raise ARMHTTPError:
    """
    try:
      crs = self.db_proxy.getConceptReferences(constraint_id)
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

    return crs

  def get_concept_reference(self, concept_reference_name):
    crs = self.get_concept_references()
    if crs is None or len(crs) < 1:
      self.close()
      raise ObjectNotFoundHTTPError('Concept Reference')
    for key in crs:
      if (key == concept_reference_name):
        cr = crs[key]
        return cr 
    self.close()
    raise ObjectNotFoundHTTPError('The provided concept reference parameters')

  def add_concept_reference(self, cr):
    crParams = ConceptReferenceParameters(
      refName=cr.theName,
      dimName=cr.theDimName,
      objtName=cr.theObjtName,
      cDesc=cr.theDescription)
    try:
      self.db_proxy.addConceptReference(crParams)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)


  def update_concept_reference(self,cr,name):
    found_cr = self.get_concept_reference(name)
    crParams = ConceptReferenceParameters(
      refName=cr.theName,
      dimName=cr.theDimName,
      objtName=cr.theObjtName,
      cDesc=cr.theDescription)
    crParams.setId(found_cr.theId)
    try:
      self.db_proxy.updateConceptReference(crParams)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def delete_concept_reference(self, name):
    cr = self.get_concept_reference(name)
    try:
      self.db_proxy.deleteConceptReference(cr.theId,cr.dimension())
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def from_json(self, request, to_props=False):
    json = request.get_json(silent=True)
    if json is False or json is None:
      self.close()
      raise MalformedJSONHTTPError(data=request.get_data())

    json_dict = json['object']
    check_required_keys(json_dict, ConceptReferenceModel.required)
    json_dict['__python_obj__'] = ConceptReference.__module__+'.'+ ConceptReference.__name__
    cr = json_serialize(json_dict)
    cr = json_deserialize(cr)

    if isinstance(cr, ConceptReference):
      return cr
    else:
      self.close()
      raise MalformedJSONHTTPError()
