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

$("#obstaclesClick").click(function(){
  createEditObstaclesTable();
});

$("#obstacleMenuClick").click(function(){
  createEditObstaclesTable();
});

function createEditObstaclesTable(){
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crfossDomain: true,
    url: serverIP + "/api/obstacles",
    success: function (data) {
      setTableHeader("EditObstacles");
      var theTable = $(".theTable");
      $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
      var textToInsert = [];
      var i = 0;

      $.each(data, function(count, item) {
        textToInsert[i++] = "<tr>";
        textToInsert[i++] = '<td class="deleteObstacleButton"><i class="fa fa-minus" value="' + item.theName + '"></i></td>';

        textToInsert[i++] = '<td class="obstacle-rows" name="theName">';
        textToInsert[i++] = item.theName;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theOriginator">';
        textToInsert[i++] = item.theOriginator;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="Status">';
        if(item.theColour == 'black'){
          textToInsert[i++] = "Check";
        }
        else if(item.theColour == 'red'){
          textToInsert[i++] = "To refine";
        }
        else {
          textToInsert[i++] = "OK";
        }

        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theId"  style="display:none;">';
        textToInsert[i++] = item.theId;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '</tr>';
      });
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
  })
}

$(document).on('click', "td.obstacle-rows",function() {
  var obsName = $(this).text();
  viewObstacle(obsName);
});

var mainContent = $("#objectViewer");
mainContent.on('click', ".obstacleEnvProperties", function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var name = $(this).text();
  $.session.set("ObstacleEnvName", name);
  emptyGoalEnvTables();

  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == name){
      $("#theDefinition").val(env.theDefinition);
      $("#theCategory").val(env.theCategory);

      $.each(env.theGoalRefinements, function (index, obstacle) {
        appendObstacleEnvGoals(obstacle);
      });
      $.each(env.theSubGoalRefinements, function (index, subobstacle) {
        appendObstacleSubGoal(subobstacle);
      });
      $.each(env.theConcerns, function (index, concern) {
        appendObstacleConcern(concern);
      });
    }
  });
});

mainContent.on('click',".obstacle_deleteGoalSubGoal", function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var subGoalName =  $(this).closest("tr").find(".subGoalName").text();
  $(this).closest("tr").remove();
  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envName){
      $.each(env.theSubGoalRefinements, function (ix, subobstacle) {
        if(subobstacle[0] == subGoalName){
          env.theSubGoalRefinements.splice(ix,1)
        }
      });
    }
  });
  $.session.set("Obstacle", JSON.stringify(obstacle));
});

mainContent.on('click',"#addConcerntoObstacle", function () {
  var filterList = [];
  $("#editObstaclesConcernTable").find('tbody').find('.ObstacleConcernName').each(function (index, td) {
    filterList.push($(td).text());
  });

  var envName = $.session.get("ObstacleEnvName");

  refreshDimensionSelector($('#chooseEnvironmentSelect'),'asset',envName,function(){
    $('#chooseEnvironment').attr('data-chooseDimension','concern');
    $('#chooseEnvironment').attr('data-applyEnvironmentSelection','addObstacleConcern');
    $('#chooseEnvironment').modal('show');
  },filterList);
});

function addObstacleConcern() {
  var text = $("#chooseEnvironmentSelect").val();
  var envName = $.session.get("ObstacleEnvName");
  var obstacle = JSON.parse($.session.get("Obstacle"));
  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envName){
      env.theConcerns.push(text);
      appendObstacleConcern(text);
      $.session.set("Obstacle", JSON.stringify(obstacle));
    }
  });
};

mainContent.on('click',".obstacle_deleteGoalGoal", function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var subGoalName =  $(this).closest("tr").find(".envGoalName").text();
  $(this).closest("tr").remove();
  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envName){
      $.each(env.theGoalRefinements, function (ix, theobstacle) {
        if(typeof theobstacle != "undefined"){
          if(theobstacle[0] == subGoalName){
            env.theGoalRefinements.splice(ix,1)
          }
        }
      });
    }
  });
  $.session.set("Obstacle", JSON.stringify(obstacle));
});



mainContent.on('click',".deleteObstacleEnvConcern", function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var name =  $(this).closest("tr").find(".ObstacleConcernName").text();
  $(this).closest("tr").remove();
  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envName){
      $.each(env.theConcerns, function (ix, thecon) {
        if(typeof thecon != "undefined"){
          if(thecon == name){
            env.theConcerns.splice(ix,1)
          }
        }
      });
    }
  });
  $.session.set("Obstacle", JSON.stringify(obstacle));
});

mainContent.on('click', '#obstacle_addSubGoaltoGoal', function () {
  $("#obstacle_editGoalSubGoal").attr('data-selectedIdx',undefined);
  $("#obstacle_editGoalSubGoal").attr('data-currentObstacle',undefined);
  $("#obstacle_editGoalSubGoal").modal('show');
});

$(document).on('shown.bs.modal','#obstacle_editGoalSubGoal',function() {
  fillObstacleEditSubGoal();
  var currentObstacle = $('#obstacle_editGoalSubGoal').attr('data-currentObstacle');
  if (currentObstacle != undefined) {
    currentObstacle = JSON.parse(currentObstacle);
    $("#obstacle_theSubgoalType").val(currentObstacle.type);
    $("#obstacle_theRefinementSelect").val(currentObstacle.refinement);
    $("#obstacle_theAlternate").val(currentObstacle.target);
    $("#obstacle_theGoalSubGoalRationale").val(currentObstacle.rationale);
  }
});

mainContent.on('click', '#obstacle_addGoaltoGoal', function () {
  $("#obstacle_editGoalGoal").attr('data-selectedIdx',undefined);
  $("#obstacle_editGoalGoal").attr('data-currentObstacle',undefined);
  $("#obstacle_editGoalGoal").modal('show');
});

$(document).on('shown.bs.modal','#obstacle_editGoalGoal',function() {
  fillObstacleEditGoal();
  var currentObstacle = $('#obstacle_editGoalGoal').attr('data-currentObstacle');
  if (currentObstacle != undefined) {
    currentObstacle = JSON.parse(currentObstacle);
    $("#obstacle_theGoalType").val(currentObstacle.type);
    $("#obstacle_theGoalRefinementSelect").val(currentObstacle.refinement);
    $("#obstacle_theGoalAlternate").val(currentObstacle.target);
    $("#obstacle_theGoalGoalRationale").val(currentObstacle.rationale);
  }
});



mainContent.on("click", "#addObstacleEnvironment", function () {
  var filterList = [];
  $(".obstacleEnvProperties").each(function (index, tag) {
    filterList.push($(tag).text());
  });

  refreshDimensionSelector($('#chooseEnvironmentSelect'),'environment',undefined,function(){
    $('#chooseEnvironment').attr('data-chooseDimension','environment');
    $('#chooseEnvironment').attr('data-applyEnvironmentSelection','addObstacleEnvironment');
    $('#chooseEnvironment').modal('show');
  },filterList);
});

function addObstacleEnvironment() {
  var text = $("#chooseEnvironmentSelect").val();
  appendObstacleEnvironment(text);
  var environment =  jQuery.extend(true, {},obstacleEnvDefault );
  environment.theEnvironmentName = text;
  var obstacle = JSON.parse($.session.get("Obstacle"));
  $.session.set("ObstacleEnvName", text);
  obstacle.theEnvironmentProperties.push(environment);
  clearObstacleEnvironmentPanel();
  $("#obstacleProperties").show("fast");
  $.session.set("Obstacle", JSON.stringify(obstacle));
};

function clearObstacleEnvironmentPanel() {
  $('#theCategory').val('');
  $('#theDefinition').val('');
  $("#editObstaclesGoalsTable").find("tbody").empty();
  $("#editObstaclesSubGoalsTable").find("tbody").empty();
  $("#editObstaclesConcernTable").find("tbody").empty();
}

mainContent.on('click', ".deleteObstacleEnv", function () {
  var envi = $(this).next(".obstacleEnvProperties").text();
  $(this).closest("tr").remove();
  var obstacle = JSON.parse($.session.get("Obstacle"));
  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envi){
      obstacle.theEnvironmentProperties.splice( index ,1 );
      $.session.set("Obstacle", JSON.stringify(obstacle));
      clearObstacleEnvironmentPanel();
      var UIenv =  $("#theObstacleEnvironments").find("tbody");
      if(jQuery(UIenv).has(".obstacleEnvProperties").length){
        UIenv.find(".obstacleEnvProperties:first").trigger('click');
      }
      else {
        $("#obstacleProperties").hide("fast");
      }
      return false;
    }
  });
});

mainContent.on('click', '#obstacle_updateGoalSubGoal', function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var selectedIdx = $("#obstacle_editGoalSubGoal").attr('data-selectedIndex');
  if(selectedIdx == undefined) {
    $.each(obstacle.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == envName){
        var array = [];
        array[1] = $("#obstacle_theSubgoalType").val();
        array[0] = $("#obstacle_theSubGoalName").val();
        array[2] = $("#obstacle_theRefinementSelect").val();
        array[3] = $("#obstacle_theAlternate").val();
        array[4] = $("#obstacle_theGoalSubGoalRationale").val();
        env.theSubGoalRefinements.push(array);
        appendObstacleSubGoal(array);
        $.session.set("Obstacle", JSON.stringify(obstacle));
        $("#obstacle_editGoalSubGoal").modal('hide');
      }
    });
  } 
  else {
    var oldName = $.session.get("oldsubGoalName");
    $.each(obstacle.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == envName){
        $.each(env.theSubGoalRefinements, function (index, arr) {
          if(arr[0] == oldName) {
            arr[1] = $("#obstacle_theSubgoalType").val();
            arr[0] = $("#obstacle_theSubGoalName").val();
            arr[2] = $("#obstacle_theRefinementSelect").val();
            arr[3] = $("#obstacle_theAlternate").val();
            arr[4] = $("#obstacle_theGoalSubGoalRationale").val();
            $.session.set("Obstacle", JSON.stringify(obstacle));
            $('#editObstaclesSubGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(1)").text(arr[0]);
            $('#editObstaclesSubGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(2)").text(arr[1]);
            $('#editObstaclesSubGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(3)").text(arr[2]);
            $('#editObstaclesSubGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(4)").text(arr[3]);
            $('#editObstaclesSubGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(5)").text(arr[4]);
            $("#obstacle_editGoalSubGoal").modal('hide');
          }
        });
      }
    });
  }
});


mainContent.on('click', '#obstacle_updateGoalGoal', function () {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var selectedIdx = $("#obstacle_editGoalGoal").attr('data-selectedIndex');
  if(selectedIdx == undefined) {
    $.each(obstacle.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == envName){
        var array = [];
        array[1] = $("#obstacle_theGoalType").val();
        array[0] = $("#obstacle_theGoalName").val();
        array[2] = $("#obstacle_theGoalRefinementSelect").val();
        array[3] = $("#obstacle_theGoalAlternate").val();
        array[4] = $("#obstacle_theGoalGoalRationale").val();
        env.theGoalRefinements.push(array);
        appendObstacleEnvGoals(array);
        $.session.set("Obstacle", JSON.stringify(obstacle));
        $("#obstacle_editGoalGoal").modal('hide');
      }
    });
  } 
  else {
    var oldName = $.session.get("oldGoalName");
    $.each(obstacle.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == envName){
        $.each(env.theGoalRefinements, function (index, arr) {
          if(arr[0] == oldName) {
            arr[1] = $("#obstacle_theGoalType").val();
            arr[0] = $("#obstacle_theGoalName").val();
            arr[2] = $("#obstacle_theGoalRefinementSelect").val();
            arr[3] = $("#obstacle_theGoalAlternate").val();
            arr[4] = $("#obstacle_theGoalGoalRationale").val();
            $.session.set("Obstacle", JSON.stringify(obstacle));
            $('#editObstaclesGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(1)").text(arr[0]);
            $('#editObstaclesGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(2)").text(arr[1]);
            $('#editObstaclesGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(3)").text(arr[2]);
            $('#editObstaclesGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(4)").text(arr[3]);
            $('#editObstaclesGoalsTable').find('tbody').find('tr:eq(' + selectedIdx + ')').find("td:eq(5)").text(arr[4]);
            $("#obstacle_editGoalGoal").modal('hide');
          }
        });
      }
    });
  }
});

mainContent.on('change', ".obstacleAutoUpdater" ,function() {
  var obstacle = JSON.parse($.session.get("Obstacle"));
  var envName = $.session.get("ObstacleEnvName");
  var name = $(this).attr("name");
  var element = $(this);

  $.each(obstacle.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envName){
      env.theDefinition = $('#theDefinition').val();
      env.theCategory = $('#theCategory').val();
      obstacle.theEnvironmentProperties[index] = env;
      $.session.set("Obstacle", JSON.stringify(obstacle));
    }
  });
});

$(document).on('click', '#addNewObstacle', function () {
  fillObstacleOptionMenu(null, function () {
    clearObstacleEnvironmentPanel();
    $("#editObstacleOptionsForm").validator();
    $("#editObstacleOptionsForm").addClass('new');
    $("#obstacleProperties").hide();
    $("#updateObstacleButton").text("Create");
  });
});


mainContent.on('click', "#updateObstacleButton", function (e) {
  e.preventDefault();
  var obstacle = JSON.parse($.session.get("Obstacle"));
  if (obstacle.theEnvironmentProperties.length == 0) {
    alert("Environments not defined");
  }
  else {
    var oldName = obstacle.theName;
    obstacle.theName = $("#theName").val();
    obstacle.theOriginator = $("#theOriginator").val();
    var tags = $("#theTags").text().split(", ");
    if(tags[0] != ""){
      obstacle.theTags = tags;
    }
    if($("#editObstacleOptionsForm").hasClass("new")){
      postObstacle(obstacle, function () {
        createEditObstaclesTable();
        $("#editObstacleOptionsForm").removeClass("new")
      });
    } 
    else {
      putObstacle(obstacle, oldName, function () {
        createEditObstaclesTable();
      });
    }
  }
});

mainContent.on('dblclick', '.obstacle_editGoalSubGoalRow', function () {
  var refRow = $(this).closest('tr');
  var currentObs = {}
  currentObs.name = refRow.find("td").eq(1).text();
  currentObs.type = refRow.find("td").eq(2).text();
  currentObs.refinement = refRow.find("td").eq(3).text();
  currentObs.target = refRow.find("td").eq(4).text();
  currentObs.rationale = refRow.find("td").eq(5).text();
  $.session.set("oldsubGoalName", currentObs.name);
  $("#obstacle_editGoalSubGoal").attr('data-currentObstacle',JSON.stringify(currentObs));
  $("#obstacle_editGoalSubGoal").attr('data-selectedIndex',refRow.index());
  $("#obstacle_theSubgoalType").val(currentObs.type);
  $("#obstacle_theRefinementSelect").val(currentObs.refinement);
  $("#obstacle_theAlternate").val(currentObs.target);
  $("#obstacle_theGoalSubGoalRationale").val(currentObs.rationale);
  $("#obstacle_editGoalSubGoal").modal('show');
});

mainContent.on('dblclick', '.obstacle_editGoalGoalRow', function () {
  var refRow = $(this).closest('tr');
  var currentObs = {}
  currentObs.name = refRow.find("td").eq(1).text();
  currentObs.type = refRow.find("td").eq(2).text();
  currentObs.refinement = refRow.find("td").eq(3).text();
  currentObs.target = refRow.find("td").eq(4).text();
  currentObs.rationale = refRow.find("td").eq(5).text();
  $.session.set("oldGoalName", currentObs.name);
  $("#obstacle_editGoalGoal").attr('data-currentObstacle',JSON.stringify(currentObs));
  $("#obstacle_editGoalGoal").attr('data-selectedIndex',refRow.index());
  $("#obstacle_theGoalType").val(currentObs.type);
  $("#obstacle_theGoalRefinementSelect").val(currentObs.refinement);
  $("#obstacle_theGoalAlternate").val(currentObs.target);
  $("#obstacle_theGoalGoalRationale").val(currentObs.rationale);
  $("#obstacle_editGoalGoal").modal('show');
});

function viewObstacle(obsName){
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/obstacles/name/" + obsName.replace(" ", "%20"),
    success: function (data) {
      fillObstacleOptionMenu(data);
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function fillObstacleOptionMenu(data,callback){
  activeElement("objectViewer");
  fillOptionMenu("fastTemplates/editObstaclesOptions.html","#objectViewer",null,true,true, function(){
    $("#updateObstacleButton").text("Update");
    if(data != null) {
      $.session.set("Obstacle", JSON.stringify(data));
      $('#editObstacleOptionsForm').loadJSON(data, null);

      $.each(data.theTags, function (index, tag) {
        $("#theTags").append(tag + ", ");
      });
      clearObstacleEnvironmentPanel();
      $.each(data.theEnvironmentProperties, function (index, prop) {
        appendObstacleEnvironment(prop.theEnvironmentName);
      });
      $("#editObstacleOptionsForm").validator('update');
      $("#theObstacleEnvironments").find(".obstacleEnvProperties:first").trigger('click');
    }
    else {
      var obstacle =  jQuery.extend(true, {},obstacleDefault );
      $.session.set("Obstacle", JSON.stringify(obstacle));
    }
    if (jQuery.isFunction(callback)) {
      callback();
    }
  });
}

function fillObstacleEditSubGoal(theSettableValue){
  refreshDimensionSelector($('#obstacle_theSubGoalName'),'goal',$.session.get("ObstacleEnvName"),function() {
    if (typeof theSettableValue  !== "undefined"){
      $('#obstacle_theSubGoalName').val(theSettableValue);
    }
  },['All']);
}

function fillObstacleEditGoal(theSettableValue){
  refreshDimensionSelector($('#obstacle_theGoalName'),'goal',$.session.get("ObstacleEnvName"),function() {
    if (typeof theSettableValue  !== "undefined"){
      $('#obstacle_theGoalName').val(theSettableValue);
    }
  },['All']);
}

mainContent.on('click', '#obstacle_theGoalType', function () {
  refreshDimensionSelector($('#obstacle_theGoalName'),$('#obstacle_theGoalType').val(),$.session.get("ObstacleEnvName"),undefined,['All']);
});

mainContent.on('click', '#obstacle_theSubgoalType', function () {
  refreshDimensionSelector($('#obstacle_theSubGoalName'),$('#obstacle_theSubgoalType').val(),$.session.get("ObstacleEnvName"),undefined,['All']);
});

function appendObstacleEnvironment(text){
  $("#theObstacleEnvironments").append("<tr><td class='deleteObstacleEnv'><i class='fa fa-minus'></i></td><td class='obstacleEnvProperties'>"+ text +"</td></tr>");
}
function appendObstacleEnvGoals(obstacle){
  $("#editObstaclesGoalsTable").append('<tr class="obstacle_editGoalGoalRow"><td class="obstacle_deleteGoalGoal"><i class="fa fa-minus"></i></td><td class="envGoalName">'+obstacle[0]+'</td><td>'+obstacle[1]+'</td><td>'+obstacle[2]+'</td><td>'+obstacle[3]+'</td><td>'+obstacle[4]+'</td></tr>');
}
function appendObstacleSubGoal(subobstacle){
  $("#editObstaclesSubGoalsTable").append('<tr class="obstacle_editGoalSubGoalRow"><td class="obstacle_deleteGoalSubGoal"><i class="fa fa-minus"></i></td><td class="subGoalName">'+subobstacle[0]+'</td><td>'+subobstacle[1]+'</td><td>'+subobstacle[2]+'</td><td>'+subobstacle[3]+'</td><td>'+subobstacle[4]+'</td></tr>');
}
function appendObstacleConcern(concern){
    $("#editObstaclesConcernTable").append('<tr><td class="deleteObstacleEnvConcern" value="'+ concern+'"><i class="fa fa-minus"></i></td><td class="ObstacleConcernName">'+concern+'</td></tr>');
}

mainContent.on('click', '#closeObstacleButton', function (e) {
  e.preventDefault();
  createEditObstaclesTable();
});

$(document).on('click', "td.deleteObstacleButton", function (e) {
  e.preventDefault();
  var obsName = $(this).find('i').attr("value");
  deleteObject('obstacle',obsName,function(obsName) {
    $.ajax({
      type: "DELETE",
      dataType: "json",
      contentType: "application/json",
      accept: "application/json",
      crossDomain: true,
      processData: false,
      origin: serverIP,
      url: serverIP + "/api/obstacles/name/" + obsName.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
      success: function (data) {
        createEditObstaclesTable();
        showPopup(true);
      },
      error: function (xhr, textStatus, errorThrown) {
        var error = JSON.parse(xhr.responseText);
        showPopup(false, String(error.message));
        debugLogger(String(this.url));
        debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
      }
    });
  });
});

function putObstacle(obstacle, oldName, callback){
  var output = {};
  output.object = obstacle;
  output.session_id = $.session.get('sessionID');
  output = JSON.stringify(output);

  $.ajax({
    type: "PUT",
    dataType: "json",
    contentType: "application/json",
    accept: "application/json",
    crossDomain: true,
    processData: false,
    origin: serverIP,
    data: output,
    url: serverIP + "/api/obstacles/name/" + oldName.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
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

function postObstacle(obstacle, callback){
  var output = {};
  output.object = obstacle;
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
    url: serverIP + "/api/obstacles" + "?session_id=" + $.session.get('sessionID'),
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

