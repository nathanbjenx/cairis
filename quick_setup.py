#!/usr/bin/env python

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

from cairis.core.ARM import ARMException
from cairis.tools.quickSetup import quick_setup
from sqlalchemy.exc import SQLAlchemyError
import npyscreen as np
import os
import sys

__author__ = 'Shamal Faily'

class CAIRISDatabaseConfigurationForm(np.ActionForm):

#  quick_setup_headless.py --dbHost self.theHost --dbport self.thePort --dbRootPassword self.theRootPassword --tmpdir self.theTmpDir --rootDir self.theRootDir --imageDir self.theImageDir --configFile self.theFileName --webPort self.theWebPort --logLevel self.theLogLevel --staticDir self.theStaticDir --uploadDir self.theUploadDir --user self.theUsername --password self.thePassword

  def create(self):
    self.findRootDir()
    pathName = os.path.realpath(__file__)
    pathName = pathName.replace("quick_setup.py", "")
    self.name = "Configure CAIRIS database and initial account"
    self.theHost = self.add(np.TitleText, name = "Database host:", value = "localhost")
    self.thePort = self.add(np.TitleText, name = "Database port:", value = "3306")
    self.theRootPassword = self.add(np.TitlePassword, name = "Database root password:", value = "")
    self.theTmpDir = self.add(np.TitleText, name = "Temp directory:", value = "/tmp")
    self.theRootDir = self.add(np.TitleText, name = "Root directory:", value = pathName + "cairis")
    self.theImageDir = self.add(np.TitleText, name = "Default image directory:", value = "/tmp")
    self.theFileName = self.add(np.TitleText, name = "CAIRIS configuration file name:", value = os.environ.get("HOME") + "/cairis.cnf")
    self.theWebPort = self.add(np.TitleText,name = "Web port:", value = "7071")
    self.theLogLevel = self.add(np.TitleText,name = "Log level:", value = "debug");
    self.theStaticDir = self.add(np.TitleText,name = "Static directory:", value = pathName + "cairis/dist")
    self.theAssetDir = self.add(np.TitleText,name = "Asset directory:", value = pathName + "cairis/dist")
    self.theUploadDir = self.add(np.TitleText,name = "Upload directory:", value = "/tmp")
    self.theUsername = self.add(np.TitleText, name = "Initial Username:", value = "")
    self.thePassword = self.add(np.TitlePassword, name = "Initial Password:", value = "")

  def findRootDir(self):
    self.defaultRootDir = "/usr/local/lib/python2.7/dist-packages/cairis"
    for cpath in sys.path:
      if "/dist-packages/cairis-" in cpath and cpath.endswith(".egg"):
        self.defaultRootDir = os.path.join(cpath, "cairis")
        break

  def on_ok(self):
    try:
      quick_setup(self.theHost.value,int(self.thePort.value),self.theRootPassword.value,self.theTmpDir.value,self.theRootDir.value,self.theImageDir.value,self.theFileName.value,int(self.theWebPort.value),self.theLogLevel.value,self.theStaticDir.value,self.theAssetDir.value,self.theUploadDir.value,self.theUsername.value,self.thePassword.value)
      self.parentApp.setNextForm(None)
    except ARMException as e:
      np.notify_confirm(str(e), title = 'Error')
    except SQLAlchemyError as e:
      np.notify_confirm('Error adding CAIRIS user: ' + str(e), title = 'Error')

  def on_cancel(self):
    self.parentApp.setNextForm(None)
	
class CAIRISConfigurationApp(np.NPSAppManaged):
  def onStart(self):
    self.addForm("MAIN",CAIRISDatabaseConfigurationForm)


def main(args=None):
  if args is None:
    args = sys.argv[1:]
    App = CAIRISConfigurationApp()
    try:
      App.run()
    except np.wgwidget.NotEnoughSpaceForWidget:
      print "The terminal window is too small to display the configuration form, please resize it and try again."

if __name__ == '__main__':
  main()
