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
import jsonpickle
from cairis.core.Persona import Persona
from cairis.core.PersonaEnvironmentProperties import PersonaEnvironmentProperties
from cairis.test.CairisDaemonTestCase import CairisDaemonTestCase
import os
from cairis.mio.ModelImport import importModelFile

__author__ = 'Shamal Faily'


class PersonaAPITests(CairisDaemonTestCase):

  @classmethod
  def setUpClass(cls):
    importModelFile(os.environ['CAIRIS_SRC'] + '/../examples/exemplars/NeuroGrid/NeuroGrid.xml',1,'test')

  
  def setUp(self):
    # region Class fields
    self.logger = logging.getLogger(__name__)
    self.existing_persona_name = 'Claire'
    self.existing_environment_name = 'Psychosis'
    self.existing_direct_flag = False
    self.existing_environment_narrative = 'Nothing stipulated'
    self.existing_role_names = ['Researcher']
    persona_class = Persona.__module__+'.'+Persona.__name__
    # endregion

  def test_get_all(self):
    method = 'test_get_all'
    rv = self.app.get('/api/personas?session_id=test')
    personas = jsonpickle.decode(rv.data)
    self.assertIsNotNone(personas, 'No results after deserialization')
    self.assertIsInstance(personas, dict, 'The result is not a dictionary as expected')
    self.assertGreater(len(personas), 0, 'No personas in the dictionary')
    self.logger.info('[%s] Personas found: %d', method, len(personas))
    persona = personas.values()[0]
    self.logger.info('[%s] First persona: %s [%d]\n', method, persona['theName'], persona['theId'])

  def test_get_by_name(self):
    method = 'test_get_by_name'
    url = '/api/personas/name/%s?session_id=test' % quote(self.existing_persona_name)
    rv = self.app.get(url)
    self.assertIsNotNone(rv.data, 'No response')
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    persona = jsonpickle.decode(rv.data)
    self.assertIsNotNone(persona, 'No results after deserialization')
    self.logger.info('[%s] Persona: %s [%d]\n', method, persona['theName'], persona['theId'])

  def test_delete(self):
    method = 'test_delete'
    url = '/api/personas/name/%s?session_id=test' % quote(self.prepare_new_persona().name())
    new_persona_body = self.prepare_json()

    self.app.delete(url)
    self.logger.info('[%s] Object to delete: %s', method, new_persona_body)
    self.app.post('/api/personas', content_type='application/json', data=new_persona_body)
    self.logger.info('[%s] URL: %s', method, url)
    rv = self.app.delete(url)
    self.logger.info('[%s] Response data: %s', method, rv.data)
    self.assertIsNotNone(rv.data, 'No response')
    json_resp = jsonpickle.decode(rv.data)
    self.assertIsInstance(json_resp, dict, 'The response cannot be converted to a dictionary')
    message = json_resp.get('message', None)
    self.assertIsNotNone(message, 'No message in response')
    self.logger.info('[%s] Message: %s\n', method, message)

  def test_post(self):
    method = 'test_post'
    url = '/api/personas'
    self.logger.info('[%s] URL: %s', method, url)
    new_persona_body = self.prepare_json()

    self.app.delete('/api/personas/name/%s?session_id=test' % quote(self.prepare_new_persona().name()))
    rv = self.app.post(url, content_type='application/json', data=new_persona_body)
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = jsonpickle.decode(rv.data)
    self.assertIsNotNone(json_resp, 'No results after deserialization')
    env_id = json_resp.get('persona_id', None)
    self.assertIsNotNone(env_id, 'No persona ID returned')
    self.assertGreater(env_id, 0, 'Invalid persona ID returned [%d]' % env_id)
    self.logger.info('[%s] Persona ID: %d\n', method, env_id)

    rv = self.app.delete('/api/personas/name/%s?session_id=test' % quote(self.prepare_new_persona().name()))

  def test_put(self):
    method = 'test_put'
    url = '/api/personas'
    self.logger.info('[%s] URL: %s', method, url)
    new_persona_body = self.prepare_json()

    rv = self.app.delete('/api/personas/name/%s?session_id=test' % quote(self.prepare_new_persona().theName))
    rv = self.app.post(url, content_type='application/json', data=new_persona_body)
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    json_resp = jsonpickle.decode(rv.data)
    self.assertIsNotNone(json_resp, 'No results after deserialization')
    env_id = json_resp.get('persona_id', None)
    self.assertIsNotNone(env_id, 'No persona ID returned')
    self.assertGreater(env_id, 0, 'Invalid persona ID returned [%d]' % env_id)
    self.logger.info('[%s] Persona ID: %d', method, env_id)

    persona_to_update = self.prepare_new_persona()
    persona_to_update.theName = 'Edited test persona'
    persona_to_update.theId = env_id
    upd_env_body = self.prepare_json(persona=persona_to_update)
    rv = self.app.put('/api/personas/name/%s?session_id=test' % quote(self.prepare_new_persona().name()), data=upd_env_body, content_type='application/json')
    self.assertIsNotNone(rv.data, 'No response')
    json_resp = jsonpickle.decode(rv.data)
    self.assertIsNotNone(json_resp)
    self.assertIsInstance(json_resp, dict)
    message = json_resp.get('message', None)
    self.assertIsNotNone(message, 'No message in response')
    self.logger.info('[%s] Message: %s', method, message)
    self.assertGreater(message.find('successfully updated'), -1, 'The persona was not successfully updated')

    rv = self.app.get('/api/personas/name/%s?session_id=test' % quote(persona_to_update.name()))
    upd_persona = jsonpickle.decode(rv.data)
    self.assertIsNotNone(upd_persona, 'Unable to decode JSON data')
    self.logger.debug('[%s] Response data: %s', method, rv.data)
    self.logger.info('[%s] Persona: %s [%d]\n', method, upd_persona['theName'], upd_persona['theId'])

    rv = self.app.delete('/api/personas/name/%s?session_id=test' % quote(persona_to_update.theName))

  def prepare_new_persona(self):
    new_persona_props = [
      PersonaEnvironmentProperties(
        environmentName=self.existing_environment_name,
        direct=self.existing_direct_flag,
        description=self.existing_environment_narrative,
        roles=self.existing_role_names
      )
    ]

    new_persona = Persona(
      personaId=-1,
      personaName='Terry',
      pActivities='Some acivities',
      pAttitudes='Some attitudes',
      pAptitudes='Some aptitudes',
      pMotivations='Some motivations',
      pSkills='Some skills',
      pIntrinsic='Nothing stipulated',
      pContextual='Nothing stipulated',
      image='',
      isAssumption=False,
      pType='Primary',
      tags=['test', 'test123'],
      environmentProperties=[],
      pCodes=[]
    )
    new_persona.theEnvironmentProperties = new_persona_props

    new_persona.theEnvironmentDictionary = {}

    delattr(new_persona, 'theEnvironmentDictionary')

    return new_persona

  def prepare_dict(self, persona=None):
    if persona is None:
      persona = self.prepare_new_persona()
    else:
      assert isinstance(persona, Persona)

    return {
      'session_id': 'test',
      'object': persona,
    }

  def prepare_json(self, data_dict=None, persona=None):
    if data_dict is None:
      data_dict = self.prepare_dict(persona=persona)
    else:
      assert isinstance(data_dict, dict)
    new_persona_body = jsonpickle.encode(data_dict, unpicklable=False)
    self.logger.info('JSON data: %s', new_persona_body)
    return new_persona_body
