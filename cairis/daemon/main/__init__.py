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

__author__ = 'Shamal Faily'

import os
from flask import Blueprint
from flask_restful_swagger import swagger
from flask_restful import Api
from cairis.core.Borg import Borg

b = Borg()
main = Blueprint('main',__name__,template_folder=os.path.join(b.cairisRoot, 'templates'),static_folder=b.staticDir,static_url_path='')
api = swagger.docs(Api(main), apiVersion='1.2.10', description='CAIRIS API', api_spec_url='/api/cairis')

from cairis.daemon.main import views, errors


