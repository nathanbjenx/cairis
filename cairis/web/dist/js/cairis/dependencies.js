/*  Licensed to the Apache Software Foundation (ASF) under one
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

    Authors: Shamal Faily */

'use strict';

$('#editDependencyOptionsForm').validator().on('submit', function (e) {
  if (e.isDefaultPrevented()) {
    alert("Def prevented");
  }
});

$("#dependenciesClick").click(function(){
   createDependenciesTable()
});

// A function for filling the table with Dependencies
function createDependenciesTable(){

  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crfossDomain: true,
    url: serverIP + "/api/dependencies",
    success: function (data) {
      var dependencies = [];
      setTableHeader("Dependency");
      var theTable = $(".theTable");
      $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
      var textToInsert = [];
      var i = 0;
      var di = 0;

      $.each(data, function(count, item) {
        dependencies[di] = item;
        textToInsert[i++] = "<tr>";
        var itemKey = item.theEnvironmentName + '/' + item.theDepender + '/' + item.theDependee + '/' + item.theDependency;
        textToInsert[i++] = '<td class="deleteDependencyButton"><i class="fa fa-minus" value="' + itemKey + '"></i></td>';

        textToInsert[i++] = '<td class="dependency-rows" name="theEnvironmentName" value="' + itemKey + '">';
        textToInsert[i++] = item.theEnvironmentName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td class="dependency-rows" name="theDepender" value="' + itemKey + '">';
        textToInsert[i++] = item.theDepender;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td class="dependency-rows" name="theDependee" value="' + itemKey + '">';
        textToInsert[i++] = item.theDependee;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td class="dependency-rows" name="theDependenyType" value="' + itemKey + '">';
        textToInsert[i++] = item.theDependencyType;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td class="dependency-rows" name="theDependeny" value="' + itemKey + '">';
        textToInsert[i++] = item.theDependency;
        textToInsert[i++] = '</td>';
        textToInsert[i++] = '</tr>';
        di += 1;
      });
      $.session.set("Dependencies",JSON.stringify(dependencies));
      theTable.append(textToInsert.join(''));

      theTable.css("visibility","visible");
      $.contextMenu('destroy',$('.requirement-rows'));
      $("#mainTable").find("tbody").removeClass();

      activeElement("mainTable");
      sortTableByRow(0);
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

$(document).on('click', "td.dependency-rows", function(){
  activeElement("objectViewer");
  var dependencies = JSON.parse($.session.get("Dependencies"));
  var dependency = dependencies[$(this).index()];

  fillOptionMenu("fastTemplates/editDependencyOptions.html","#objectViewer",null,true,true, function(){
    $('#editDependencyOptionsForm').validator();
    $('#UpdateDependency').text("Update");
    $('#theRationale').val(dependency.theRationale);
    var environmentSelect = $("#theEnvironmentName");
    environmentSelect.empty()
    getEnvironments(function (envs) {
      $.each(envs, function (key,objt) {
        environmentSelect.append($('<option>', { value : objt }).text(objt));
      }); 
    });
    environmentSelect.val(dependency.theEnvironmentName);
    var dependerSelect = $("#theDependerName");
    var dependeeSelect = $("#theDependeeName");
    dependerSelect.empty()
    dependeeSelect.empty()
    getRolesInEnvironment(dependency.theEnvironmentName,function (roles) {
      $.each(roles, function (key,objt) {
        dependerSelect.append('<option>' + objt + '</option>');
        dependeeSelect.append('<option>' + objt + '</option>');
      }); 
    });
    $('#theDependerName').val(dependency.theDepender);
    $('#theDependeeName').val(dependency.theDependee);
    $("#theDependencyType").val(dependency.theDependencyType);
    $("#theDependencyName").empty();
    getDimensionsInEnvironment(dependency.theDependencyType,dependency.theEnvironmentName,function (dims) {
      $.each(dims, function (key,objt) {
        $("#theDependencyName").append('<option>' + objt + '</option>');
      }); 
    });
    $.session.set("Dependency", JSON.stringify(dependency));
    $('#editDependencyOptionsForm').loadJSON(dependency, null);
  });
});

var mainContent = $("#objectViewer");
mainContent.on('click', '#UpdateDependency', function (e) {

  e.preventDefault();
  $("#editDependencyOptionsForm").validator();

  var dependency = JSON.parse($.session.get("Dependency"));
  var oldEnvName = dependency.theEnvironmentName;
  var oldDepender = dependency.theDepender;
  var oldDependee = dependency.theDependee;
  var oldDependency = dependency.theDependency;
  dependency.theEnvironmentName = $("#theEnvironmentName").val();
  dependency.theDepender = $("#theDependerName").val();
  dependency.theDependee = $("#theDependeeName").val();
  dependency.theDependencyType = $("#theDependencyType").val();
  dependency.theDependency = $("#theDependencyName").val();
  dependency.theRationale = $("#theRationale").val();

  if($("#editDependencyOptionsForm").hasClass("new")){
    postDependency(dependency, function () {
      createDependenciesTable();
      $("#editDependencyOptionsForm").removeClass("new")
    });
  }  
  else {
    putDependency(dependency, oldEnvName, oldDepender, oldDependee,oldDependency,  function () {
      createDependenciesTable();
    });
  }
});

mainContent.on('change',"#theEnvironmentName", function() {
  var envName = $(this).find('option:selected').text();

  var dependerSelect = $("#theDependerName");
  var dependeeSelect = $("#theDependeeName");
  dependerSelect.empty();
  dependeeSelect.empty();
  getRolesInEnvironment(envName,function (roles) {
    $.each(roles, function (key,objt) {
      dependerSelect.append('<option>' + objt + '</option>');
      dependeeSelect.append('<option>' + objt + '</option>');
    }); 
  });
});


mainContent.on('change',"#theDependencyType", function() {
  var depType = $(this).find('option:selected').text();
  var envName = $("#theEnvironmentName").val();
  $("#theDependencyName").empty();
  getDimensionsInEnvironment(depType,envName,function (dims) {
    $.each(dims, function (key,objt) {
      $("#theDependencyName").append('<option>' + objt + '</option>');
    }); 
  });
});

$(document).on("click", "#addNewDependency", function () {
  activeElement("objectViewer");
  fillOptionMenu("fastTemplates/editDependencyOptions.html", "#objectViewer", null, true, true, function () {
    $('#editDependencyOptionsForm').validator();
    $('#UpdateDependency').text("Create");
    $("#editDependencyOptionsForm").addClass("new");
    $.session.set("Dependency", JSON.stringify(jQuery.extend(true, {},dependencyDefault )));

    var environmentSelect = $("#theEnvironmentName");
    environmentSelect.empty()
    getEnvironments(function (envs) {
      $.each(envs, function (key,objt) {
        environmentSelect.append($('<option>', { value : objt }).text(objt));
      }); 
    });

    var dependerSelect = $("#theDependerName");
    var dependeeSelect = $("#theDependeeName");
    dependerSelect.empty();
    dependeeSelect.empty();
    getRoles(function (roles) {
      $.each(roles, function (key,objt) {
        dependerSelect.append('<option>' + objt + '</option>');
        dependeeSelect.append('<option>' + objt + '</option>');
      }); 
    });

    var depType = $("#theDependencyType").val();
    var envName = $("#theEnvironmentName").val();
    $("#theDependencyName").empty();
    getDimensionsInEnvironment(depType,envName,function (dims) {
      $.each(dims, function (key,objt) {
        $("#theDependencyName").append('<option>' + objt + '</option>');
      }); 
    });
  });
});

$(document).on('click', 'td.deleteDependencyButton', function (e) {
  e.preventDefault();
  var dependencies = JSON.parse($.session.get("Dependencies"));
  var dependency = dependencies[$(this).index()];
  deleteDependency(dependency, function () {
    createDependenciesTable();
  });
});

mainContent.on('click', '#CloseDependency', function (e) {
  e.preventDefault();
  createDependenciesTable();
});

function deleteDependency(dependency, callback){
  $.ajax({
    type: "DELETE",
    dataType: "json",
    contentType: "application/json",
    accept: "application/json",
    crossDomain: true,
    processData: false,
    origin: serverIP,
    url: serverIP +  "/api/dependencies/environment/" + dependency.theEnvironmentName.replace(" ","%20") + "/depender/" + dependency.theDepender.replace(" ","%20") + "/dependee/" + dependency.theDependee + "/dependency/" + dependency.theDependency.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
    success: function (data) {
      showPopup(true);
      if(jQuery.isFunction(callback)){
        callback();
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      var error = JSON.parse(xhr.responseText);
      showPopup(false, String(error.message));
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function putDependency(dependency, oldEnvName, oldDepender, oldDependee, oldDependency, callback){
  var output = {};
  output.object = dependency;
  output.session_id = $.session.get('sessionID');
  output = JSON.stringify(output);
  debugLogger(output);

  $.ajax({
    type: "PUT",
    dataType: "json",
    contentType: "application/json",
    accept: "application/json",
    crossDomain: true,
    processData: false,
    origin: serverIP,
    data: output,
    url: serverIP +  "/api/dependencies/environment/" + oldEnvName.replace(" ","%20") + "/depender/" + oldDepender.replace(" ","%20") + "/dependee/" + oldDependee + "/dependency/" + oldDependency.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
    success: function (data) {
      showPopup(true);
      if(jQuery.isFunction(callback)){
        callback();
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      var error = JSON.parse(xhr.responseText);
      showPopup(false, String(error.message));
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function postDependency(dependency, callback){
  var output = {};
  output.object = dependency;
  output.session_id = $.session.get('sessionID');
  output = JSON.stringify(output);
  debugLogger(output);

  $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    accept: "application/json",
    crossDomain: true,
    processData: false,
    origin: serverIP,
    data: output,
    url: serverIP +  "/api/dependencies/environment/" + dependency.theEnvironmentName.replace(" ","%20") + "/depender/" + dependency.theDepender.replace(" ","%20") + "/dependee/" + dependency.theDependee + "/dependency/" + dependency.theDependency.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
    success: function (data) {
      showPopup(true);
      if(jQuery.isFunction(callback)){
        callback();
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      var error = JSON.parse(xhr.responseText);
      showPopup(false, String(error.message));
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function getRoles(callback) {
  getDimensions('role',callback);
}

function getRolesInEnvironment(envName,callback) {
  getDimensionsInEnvironment('role',envName,callback);
}

