/* 
  Licensed to the Apache Software Foundation (ASF) under one
  or more contributor license agreements.  See the NOTICE file
  distributed with this work for additional information
  regarding copyright ownership.  The ASF licenses this file
  to you under the Apache License, Version 2.0 (the
  "License"); you may not use this file except in compliance
  with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing,
  software distributed under the License is distributed on an
  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, either express or implied.  See the License for the
  specific language governing permissions and limitations
  under the License.
*/

grant usage on *.* to 'irisuser'@'%' identified by '' with max_queries_per_hour 0 max_connections_per_hour 0 max_updates_per_hour 0 max_user_connections 0;
grant usage on *.* to 'flaskuser'@'%' identified by 'flaskuser' with max_queries_per_hour 0 max_connections_per_hour 0 max_updates_per_hour 0 max_user_connections 0;
create database if not exists `arm`;
create database if not exists `flaskdb`;
grant all privileges on `arm`.* to 'irisuser'@'%';
grant all privileges on `flaskdb`.* to 'flaskuser'@'%';
set global max_sp_recursion_depth = 255;

alter database arm default character set utf8;
alter database arm default collate utf8_general_ci;

flush tables;
flush privileges;
