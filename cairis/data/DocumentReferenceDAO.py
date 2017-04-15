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
from cairis.core.DocumentReference import DocumentReference
from cairis.core.DocumentReferenceParameters import DocumentReferenceParameters
from cairis.daemon.CairisHTTPError import ObjectNotFoundHTTPError, MalformedJSONHTTPError, ARMHTTPError, MissingParameterHTTPError, OverwriteNotAllowedHTTPError
import cairis.core.armid
from cairis.data.CairisDAO import CairisDAO
from cairis.tools.ModelDefinitions import DocumentReferenceModel
from cairis.tools.SessionValidator import check_required_keys
from cairis.tools.JsonConverter import json_serialize, json_deserialize

__author__ = 'Shamal Faily'


class DocumentReferenceDAO(CairisDAO):
  def __init__(self, session_id):
    CairisDAO.__init__(self, session_id)

  def get_document_references(self,constraint_id = -1):
    """
    :rtype: dict[str,DocumentReference]
    :return
    :raise ARMHTTPError:
    """
    try:
      drs = self.db_proxy.getDocumentReferences(constraint_id)
    except DatabaseProxyException as ex:
      self.close()
      raise ARMHTTPError(ex)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

    return drs

  def get_document_reference(self, document_reference_name):
    drs = self.get_document_references()
    if drs is None or len(drs) < 1:
      self.close()
      raise ObjectNotFoundHTTPError('External Documents')
    for key in drs:
      if (key == document_reference_name):
        dr = drs[key]
        return dr 
    self.close()
    raise ObjectNotFoundHTTPError('The provided document reference parameters')

  def add_document_reference(self, dr):
    drParams = DocumentReferenceParameters(
      refName=dr.theName,
      docName=dr.theDocName,
      cName=dr.theContributor,
      docExc=dr.theExcerpt)
    try:
      self.db_proxy.addDocumentReference(drParams)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)


  def update_document_reference(self,dr,name):
    found_dr = self.get_document_reference(name)
    drParams = DocumentReferenceParameters(
      refName=dr.theName,
      docName=dr.theDocName,
      cName=dr.theContributor,
      docExc=dr.theExcerpt)
    drParams.setId(found_dr.theId)
    try:
      self.db_proxy.updateDocumentReference(drParams)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def delete_document_reference(self, name):
    dr = self.get_document_reference(name)
    try:
      self.db_proxy.deleteDocumentReference(dr.theId)
    except ARMException as ex:
      self.close()
      raise ARMHTTPError(ex)

  def from_json(self, request, to_props=False):
    json = request.get_json(silent=True)
    if json is False or json is None:
      self.close()
      raise MalformedJSONHTTPError(data=request.get_data())

    json_dict = json['object']
    check_required_keys(json_dict, DocumentReferenceModel.required)
    json_dict['__python_obj__'] = DocumentReference.__module__+'.'+ DocumentReference.__name__
    dr = json_serialize(json_dict)
    dr = json_deserialize(dr)

    if isinstance(dr, DocumentReference):
      return dr
    else:
      self.close()
      raise MalformedJSONHTTPError()
