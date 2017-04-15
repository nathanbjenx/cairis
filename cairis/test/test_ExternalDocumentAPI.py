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

import logging
from urllib import quote
from StringIO import StringIO
import os
import jsonpickle
from cairis.core.ExternalDocument import ExternalDocument
from cairis.test.CairisDaemonTestCase import CairisDaemonTestCase
from cairis.mio.ModelImport import importModelFile
from cairis.tools.JsonConverter import json_deserialize
import os

__author__ = 'Shamal Faily'

class ExternalDocumentAPITests(CairisDaemonTestCase):

  @classmethod
  def setUpClass(cls):
    importModelFile(os.environ['CAIRIS_SRC'] + '/../examples/exemplars/ACME_Water/ACME_Water.xml',1,'test')


  def setUp(self):
    self.logger = logging.getLogger(__name__)
    self.new_edoc = ExternalDocument(
      edId = '-1',
      edName = 'Test external document name',
      edVersion = '1',
      edDate = '2016',
      edAuths = 'SF',
      edDesc = 'Test external document description')
    self.new_edoc_dict = {
      'session_id' : 'test',
      'object': self.new_edoc
    }
    self.existing_edoc_name = 'big security worry GT concept'

  def test_get_all(self):
    method = 'test_get_external_documents'
    url = '/api/external_documents?session_id=test'
    self.logger.info('[%s] URL: %s', method, url)
    rv = self.app.get(url)
    edocs = jsonpickle.decode(rv.data)
    self.assertIsNotNone(edocs, 'No results after deserialization')
    self.assertIsInstance(edocs, dict, 'The result is not a dictionary as expected')
    self.assertGreater(len(edocs), 0, 'No external documents in the dictionary')
    self.logger.info('[%s] External documents found: %d', method, len(edocs))
    edoc = edocs.values()[0]
    self.logger.info('[%s] First external document: %s [%d]\n', method, edoc['theName'], edoc['theId'])

  def test_get_by_name(self):
    method = 'test_get_by_name'
    url = '/api/external_documents/name/%s?session_id=test' % quote(self.existing_edoc_name)
    rv = self.app.get(url)
    self.assertIsNotNone(rv.data, 'No response')
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    edoc = jsonpickle.decode(rv.data)
    self.assertIsNotNone(edoc, 'No results after deserialization')
    self.logger.info('[%s] External document: %s [%d]\n', method, edoc['theName'], edoc['theId'])

  def test_post(self):
    method = 'test_post_new'
    rv = self.app.post('/api/external_documents', content_type='application/json', data=jsonpickle.encode(self.new_edoc_dict))
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = json_deserialize(rv.data)
    self.assertIsNotNone(json_resp, 'No results after deserialization')
    ackMsg = json_resp.get('message', None)
    self.assertEqual(ackMsg, 'External Document successfully added')

  def test_put(self):
    method = 'test_put'
    self.new_edoc_dict['object'].theVersion = '2'
    url = '/api/external_documents/name/%s?session_id=test' % quote(self.existing_edoc_name)
    rv = self.app.put(url, content_type='application/json', data=jsonpickle.encode(self.new_edoc_dict))
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = json_deserialize(rv.data)
    self.assertIsNotNone(json_resp, 'No results after deserialization')
    ackMsg = json_resp.get('message', None)
    self.assertEqual(ackMsg, 'External Document successfully updated')

  def test_delete(self):
    method = 'test_delete'

    rv = self.app.post('/api/external_documents', content_type='application/json', data=jsonpickle.encode(self.new_edoc_dict))
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = json_deserialize(rv.data)

    url = '/api/external_documents/name/%s?session_id=test' % quote(self.new_edoc.theName)
    rv = self.app.delete(url)

    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = json_deserialize(rv.data)
    self.assertIsNotNone(json_resp, 'No results after deserialization')
    ackMsg = json_resp.get('message', None)
    self.assertEqual(ackMsg, 'External Document successfully deleted')
