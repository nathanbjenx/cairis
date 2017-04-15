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

__author__ = 'Robin Quetin, Shamal Faily'

import logging
import os
import httplib
from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from flask_cors import CORS
from cairis.core.Borg import Borg
import WebConfig
from cdb import db
from models import User, Role


def create_app():
  options = {
    'port' : 0,
    'unitTesting': False
  }
  WebConfig.config(options)

  b = Borg()
  app = Flask(__name__)
  app.config['DEBUG'] = True
  app.config['SECRET_KEY'] = b.secretKey
  app.config['SECURITY_PASSWORD_HASH'] = b.passwordHash
  app.config['SECURITY_PASSWORD_SALT'] = b.passwordSalt
  app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://' + b.auth_dbUser + ':' + b.auth_dbPasswd + '@' + b.auth_dbHost + '/' + b.auth_dbName
  b.logger.setLevel(b.logLevel)
  b.logger.debug('Error handlers: {0}'.format(app.error_handler_spec))
  app.secret_key = os.urandom(24)
  logger = logging.getLogger('werkzeug')
  logger.setLevel(b.logLevel)
  enable_debug = b.logLevel = logging.DEBUG

  cors = CORS(app)
  db.init_app(app)
  user_datastore = SQLAlchemyUserDatastore(db,User, Role)
  security = Security(app, user_datastore)

  from main import main as main_blueprint 
  app.register_blueprint(main_blueprint)

  with app.app_context():
    db.create_all()

  return app
