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
from cairis.test.CairisDaemonTestCase import CairisDaemonTestCase
from cairis.mio.ModelImport import importModelFile
from cairis.tools.JsonConverter import json_deserialize
import os

__author__ = 'Shamal Faily'

class SummaryAPITests(CairisDaemonTestCase):

  @classmethod
  def setUpClass(cls):
    importModelFile(os.environ['CAIRIS_SRC'] + '/../examples/exemplars/NeuroGrid/NeuroGrid.xml',1,'test')


  def setUp(self):
    self.logger = logging.getLogger(__name__)

  def test_get_summary(self):
    method = 'test_get_summary'
    url = '/api/summary/dimension/vulnerability/environment/Psychosis?session_id=test'
    self.logger.info('[%s] URL: %s', method, url)
    rv = self.app.get(url)
    sumRows = jsonpickle.decode(rv.data)
    self.assertIsNotNone(sumRows, 'No results after deserialization')
    self.logger.info('[%s] Rows: %d', method, len(sumRows))
    self.assertEquals(len(sumRows),3)
    self.assertEquals(sumRows[0]['theLabel'],'Catastrophic')
    self.assertEquals(sumRows[0]['theValue'],1)
    self.assertEquals(sumRows[1]['theLabel'],'Critical')
    self.assertEquals(sumRows[1]['theValue'],2)
    self.assertEquals(sumRows[2]['theLabel'],'Marginal')
    self.assertEquals(sumRows[2]['theValue'],1)
