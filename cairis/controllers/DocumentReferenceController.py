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

import httplib
from flask import session, request, make_response
from flask_restful_swagger import swagger
from flask_restful import Resource
from cairis.data.DocumentReferenceDAO import DocumentReferenceDAO
from cairis.tools.JsonConverter import json_serialize
from cairis.tools.MessageDefinitions import DocumentReferenceMessage
from cairis.tools.ModelDefinitions import DocumentReferenceModel
from cairis.tools.SessionValidator import get_session_id

__author__ = 'Shamal Faily'


class DocumentReferencesAPI(Resource):
  #region Swagger Doc
  @swagger.operation(
    notes='Get all document references',
    responseClass=DocumentReferenceModel.__name__,
    nickname='document_references-get',
    parameters=[
      {
        "name": "session_id",
        "description": "The ID of the user's session",
        "required": False,
        "allowMultiple": False,
        "dataType": str.__name__,
        "paramType": "query"
      }
    ],
    responseMessages=[
      {
        "code": httplib.BAD_REQUEST,
        "message": "The database connection was not properly set up"
      }
    ]
  )
  #endregion
  def get(self):
    session_id = get_session_id(session, request)
    constraint_id = request.args.get('constraint_id', -1)

    dao = DocumentReferenceDAO(session_id)
    drs = dao.get_document_references(constraint_id=constraint_id)
    dao.close()

    resp = make_response(json_serialize(drs, session_id=session_id))
    resp.headers['Content-Type'] = "application/json"
    return resp

  #region Swagger Doc
  @swagger.operation(
    notes='Creates a new document reference',
    nickname='document_reference-post',
    parameters=[
      {
        "name": "body",
        "description": "The serialized version of the new document reference to be added",
        "required": True,
        "allowMultiple": False,
        "type": DocumentReferenceMessage.__name__,
        "paramType": "body"
      },
      {
        "name": "session_id",
        "description": "The ID of the user's session",
        "required": False,
        "allowMultiple": False,
        "dataType": str.__name__,
        "paramType": "query"
      }
    ],
    responseMessages=[
      {
        'code': httplib.BAD_REQUEST,
        'message': 'One or more attributes are missing'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'Some problems were found during the name check'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'A database error has occurred'
      }
    ]
  )
  #endregion
  def post(self):
    session_id = get_session_id(session, request)

    dao = DocumentReferenceDAO(session_id)
    new_dr = dao.from_json(request)
    dao.add_document_reference(new_dr)
    dao.close()

    resp_dict = {'message': 'Document Reference successfully added'}
    resp = make_response(json_serialize(resp_dict, session_id=session_id), httplib.OK)
    resp.contenttype = 'application/json'
    return resp


class DocumentReferenceByNameAPI(Resource):
  # region Swagger Doc
  @swagger.operation(
    notes='Get a document reference by name',
    responseClass=DocumentReferenceModel.__name__,
    nickname='document_reference-by-name-get',
    parameters=[
      {
        "name": "session_id",
        "description": "The ID of the user's session",
        "required": False,
        "allowMultiple": False,
        "dataType": str.__name__,
        "paramType": "query"
      }
    ],
    responseMessages=[
      {
        "code": httplib.BAD_REQUEST,
        "message": "The database connection was not properly set up"
      }
    ]
  )
  # endregion
  def get(self, name):
    session_id = get_session_id(session, request)

    dao = DocumentReferenceDAO(session_id)
    found_dr = dao.get_document_reference(name)
    dao.close()

    resp = make_response(json_serialize(found_dr, session_id=session_id))
    resp.headers['Content-Type'] = "application/json"
    return resp

  #region Swagger Doc
  @swagger.operation(
    notes='Updates an existing document reference',
    nickname='document_reference-put',
    parameters=[
      {
        "name": "body",
        "description": "The serialized version of the document reference to be updated",
        "required": True,
        "allowMultiple": False,
        "type": DocumentReferenceMessage.__name__,
        "paramType": "body"
      },
      {
        "name": "session_id",
        "description": "The ID of the user's session",
        "required": False,
        "allowMultiple": False,
        "dataType": str.__name__,
        "paramType": "query"
      }
    ],
    responseMessages=[
      {
        'code': httplib.BAD_REQUEST,
        'message': 'One or more attributes are missing'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'Some problems were found during the name check'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'A database error has occurred'
      }
    ]
  )
  #endregion
  def put(self, name):
    session_id = get_session_id(session, request)

    dao = DocumentReferenceDAO(session_id)
    upd_dr = dao.from_json(request)
    dao.update_document_reference(upd_dr, name)
    dao.close()

    resp_dict = {'message': 'Document Reference successfully updated'}
    resp = make_response(json_serialize(resp_dict), httplib.OK)
    resp.contenttype = 'application/json'
    return resp

  #region Swagger Doc
  @swagger.operation(
    notes='Deletes an existing document reference',
    nickname='document_reference-by-id-delete',
    parameters=[
      {
        "name": "session_id",
        "description": "The ID of the user's session",
        "required": False,
        "allowMultiple": False,
        "dataType": str.__name__,
        "paramType": "query"
      }
    ],
    responseMessages=[
      {
        'code': httplib.BAD_REQUEST,
        'message': 'One or more attributes are missing'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'Some problems were found during the name check'
      },
      {
        'code': httplib.CONFLICT,
        'message': 'A database error has occurred'
      }
    ]
  )
  #endregion
  def delete(self, name):
    session_id = get_session_id(session, request)

    dao = DocumentReferenceDAO(session_id)
    dao.delete_document_reference(name)
    dao.close()

    resp_dict = {'message': 'Document Reference successfully deleted'}
    resp = make_response(json_serialize(resp_dict), httplib.OK)
    resp.contenttype = 'application/json'
    return resp
