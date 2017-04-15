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

    Authors: Raf Vandelaer, Shamal Faily */

'use strict';

$("#attackerMenuClick").click(function () {
  createAttackersTable();
});

function createAttackersTable(){
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/attackers",
    success: function (data) {
      setTableHeader("Attackers");
      var theTable = $(".theTable");
      $(".theTable tr").not(function(){if ($(this).has('th').length){return true}}).remove();
      var textToInsert = [];
      var i = 0;

      $.each(data, function(key, item) {
        textToInsert[i++] = "<tr>";
        textToInsert[i++] = '<td class="deleteAttackerButton"><i class="fa fa-minus" value="' + item.theName + '"></i></td>';
        textToInsert[i++] = '<td class="attacker-rows" name="theName">';
        textToInsert[i++] = key;
        textToInsert[i++] = '</td>';

        textToInsert[i++] = '<td name="theType">';
        textToInsert[i++] = item.theDescription;
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

$(document).on('click', "td.attacker-rows", function () {
  var attackerName = $(this).text();
  viewAttacker(attackerName);
});

function viewAttacker(attackerName) {
  activeElement("objectViewer"); 
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/attackers/name/" + attackerName.replace(" ", "%20"),
    success: function (data) {
      fillOptionMenu("fastTemplates/editAttackerOptions.html", "#objectViewer", null, true, true, function () {
        $("#UpdateAttacker").text("Update");
        $.session.set("Attacker", JSON.stringify(data));
        $('#editAttackerOptionsForm').loadJSON(data, null);
        var tags = data.theTags;
        var text = "";
        $.each(tags, function (index, type) {
          text += type + ", ";
        });
        $("#theTags").val(text);
        $.each(data.theEnvironmentProperties, function (index, env) {
          appendAttackerEnvironment(env.theEnvironmentName);
        });
        $("#theAttackerEnvironments").find(".attackerEnvironment:first").trigger('click');
        $("#theAttackerImage").attr("src",getImagedir(data.theImage));
        rescaleImage($("#theAttackerImage"),225);
        $("#editAttackerOptionsForm").validator('update');
      });
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText + ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
};

var mainContent = $("#objectViewer");
mainContent.on("click",".attackerEnvironment", function () {
  clearAttackerEnvInfo();
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $(this).text();
  $.session.set("attackerEnvironmentName", theEnvName);
  $.each(attacker.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == theEnvName){
      $.each(env.theMotives, function (index, motive) {
        appendAttackerMotive(motive);
      });
      $.each(env.theRoles, function (index, role) {
        appendAttackerRole(role);
      });
      $.each(env.theCapabilities, function (index, cap) {
        appendAttackerCapability(cap);
      });
    }
  });
});

mainContent.on("click", "#addMotivetoAttacker", function () {
  var hasMot = [];
  var theEnvName =  $.session.get("attackerEnvironmentName");
  $(".attackerMotive").each(function (index, tag) {
    hasMot.push($(tag).text());
  });
  motivationDialogBox(hasMot, function (text) {
    var attacker = JSON.parse($.session.get("Attacker"));

    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        env.theMotives.push(text);
      }
    });
    appendAttackerMotive(text);
    $.session.set("Attacker", JSON.stringify(attacker));
  });
});

mainContent.on('click', "#addCapabilitytoAttacker", function () {

  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");

  var hasCaps = [];
  $("#attackerCapability").find(".attackerCapability").each(function(index, asset){
    hasCaps.push($(asset).text());
  });

  attackerPropertyDialogBox(hasCaps, undefined, function (cap) {
    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        attacker.theEnvironmentProperties[index].theCapabilities.push(cap);
        $.session.set("Attacker", JSON.stringify(attacker));
        appendAttackerCapability(cap);
      }
    });
  });
});


mainContent.on('dblclick', ".changeCapability", function () {
  var capRow = $(this).closest("tr");
  var currentCap = {};
  currentCap.name = capRow.find("td:eq(1)").text();
  currentCap.value = capRow.find("td:eq(2)").text();
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");

  var hasCaps = [];
  $("#attackerCapability").find(".attackerCapability").each(function(index, asset){
    hasCaps.push($(asset).text());
  });

  attackerPropertyDialogBox(hasCaps, currentCap, function (updCap) {
    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        $.each(env.theCapabilities,function(idx,cap) {
          if (cap.name == updCap.name) {
            attacker.theEnvironmentProperties[index].theCapabilities[idx].value = updCap.value;
            $.session.set("Attacker", JSON.stringify(attacker));
            capRow.find("td:eq(1)").text(updCap.name);
            capRow.find("td:eq(2)").text(updCap.value);
          }
        });
      }
    });
  });
});


function attackerPropertyDialogBox(hasCap,currentCap,callback){
  var dialogwindow = $("#addAttackerPropertyDialog");
  var select = $("#theCap");
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/attackers/capabilities",
    success: function (data) {
      select.empty();
      var none = true;
      if(typeof currentCap != 'undefined' ){
        select.append("<option value=" + currentCap.name + ">" + currentCap.name + "</option>");
        select.val(currentCap.name);
        $("#thePropValue").val(currentCap.value);
      }
      $.each(data, function(key, object) {
        var found = false;
        $.each(hasCap,function(index, text) {
          if(text == object.theName){
            found = true
          }
        });
        if(!found) {
          select.append("<option value=" + object.theName + ">" + object.theName + "</option>");
          none = false;
        }
      });

      if(!none) {
        dialogwindow.dialog({
          modal: true,
          buttons: {
            Ok: function () {
              var prop = {};
              prop.name = $("#theCap option:selected").text();
              prop.value = $("#thePropValue option:selected").text();
              if(jQuery.isFunction(callback)){
                callback(prop);
              }
              $(this).dialog("close");
            }
          }
        });
        $("#addAttackPropertyDialog.").show();
      }
      else {
        alert("All possible capabilities are already added");
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}


mainContent.on('click', ".removeAttackerMotive", function () {
  var text = $(this).next(".attackerMotive").text();
  $(this).closest("tr").remove();
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");
  $.each(attacker.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == theEnvName){
      $.each(env.theMotives, function (index2, mot) {
        if(mot == text){
          env.theMotives.splice( index2 ,1 );
          $.session.set("Attacker", JSON.stringify(attacker));
          return false;
        }
      });
    }
  });
});

mainContent.on('click', ".removeAttackerRole", function () {
  var text = $(this).next(".attackerRole").text();
  $(this).closest("tr").remove();
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");
  $.each(attacker.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == theEnvName){
      $.each(env.theRoles, function (index2, role) {
        if(role == text){
          env.theRoles.splice( index2 ,1 );
          $.session.set("Attacker", JSON.stringify(attacker));
          return false;
        }
      });
    }
  });
});

mainContent.on('click', ".deleteAttackerEnv", function () {
  var envi = $(this).next(".attackerEnvironment").text();
  $(this).closest("tr").remove();
  var attacker = JSON.parse($.session.get("Attacker"));
  $.each(attacker.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == envi){
      attacker.theEnvironmentProperties.splice( index ,1 );
      $.session.set("Attacker", JSON.stringify(attacker));
      clearAttackerEnvInfo();

      var UIenv = $("#theAttackerEnvironments").find("tbody");
      if(jQuery(UIenv).has(".attackerEnvironment").length){
        UIenv.find(".attackerEnvironment:first").trigger('click');
      }
      else {
        $("#Properties").hide("fast");
      }
      return false;
    }
  });
});

mainContent.on("click", "#addAttackerEnv", function () {
  var hasEnv = [];
  $(".attackerEnvironment").each(function (index, tag) {
    hasEnv.push($(tag).text());
  });
  environmentDialogBox(hasEnv, function (text) {
    appendAttackerEnvironment(text);
    var environment =  jQuery.extend(true, {},attackerEnvDefault );
    environment.theEnvironmentName = text;
    var attacker = JSON.parse($.session.get("Attacker"));
    attacker.theEnvironmentProperties.push(environment);
    $.session.set("Attacker", JSON.stringify(attacker));
    $(document).find(".attackerEnvironment").each(function () {
      if($(this).text() == text){
        $(this).trigger("click");
        $("#Properties").show("fast");
      }
    });
  });
});

mainContent.on('click', '#addRoletoAttacker', function () {
  var hasRole = [];
  $("#attackerRole").find(".attackerRole").each(function(index, role){
    hasRole.push($(role).text());
  });
  roleDialogBox(hasRole, function (text) {
    var attacker = JSON.parse($.session.get("Attacker"));
    var theEnvName = $.session.get("attackerEnvironmentName");
    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        env.theRoles.push(text);
        $.session.set("Attacker", JSON.stringify(attacker));
        appendAttackerRole(text);
      }
    });
  });
});

mainContent.on('click', '#UpdateAttacker', function (e) {
  e.preventDefault();
  $("#editAttackerOptionsForm").validator('validate');
  var attacker = JSON.parse($.session.get("Attacker"));
  if (attacker.theEnvironmentProperties.length == 0) {
    alert("Environments not defined");
  }
  else {
    var oldName = attacker.theName;
    attacker.theName = $("#theName").val();
    attacker.theDescription = $("#theDescription").val();
    var tags = $("#theTags").text().split(", ");
    if(tags[0] != ""){
      attacker.theTags = tags;
    }
    if($("#editAttackerOptionsForm").hasClass("new")){
      postAttacker(attacker, function () {
        createAttackersTable();
        $("#editAttackerOptionsForm").removeClass("new")
      });
    } 
    else {
      putAttacker(attacker, oldName, function () {
        createAttackersTable();
      });
    }
  }
});

$(document).on("click", "#addNewAttacker", function () {
  activeElement("objectViewer"); 
  fillOptionMenu("fastTemplates/editAttackerOptions.html", "#objectViewer", null, true, true, function () {
    $("#editAttackerOptionsForm").validator();
    $("#UpdateAttacker").text("Create");
    $("#editAttackerOptionsForm").addClass("new");
    $("#Properties").hide();
    $.session.set("Attacker", JSON.stringify(jQuery.extend(true, {},attackerDefault )));
  });
});

/*
mainContent.on('click', "#UpdateAttackerCapability", function () {
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");
  if($("#addAttackerPropertyDiv").hasClass("new")){
    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        var prop = {};
        prop.name = $("#theCap option:selected").text();
        prop.value = $("#thePropValue option:selected").text();
        env.theCapabilities.push(prop);
        $.session.set("Attacker", JSON.stringify(attacker));
        appendAttackerCapability(prop);
        attackerToggle();
      }
    });
  }
  else {
    var oldCapName = $.session.get("AttackerCapName");
    $.each(attacker.theEnvironmentProperties, function (index, env) {
      if(env.theEnvironmentName == theEnvName){
        $.each(env.theCapabilities, function (index, cap) {
          if(oldCapName == cap.name){
            cap.name = $("#theCap option:selected").text();
            cap.value = $("#thePropValue option:selected").text();
          }
        });
        $.session.set("Attacker", JSON.stringify(attacker));
        $("#theAttackerEnvironments").find(".attackerEnvironment:first").trigger('click');
        attackerToggle();
      }
    });
  }
}); 
*/

mainContent.on("click", ".removeAttackerCapability", function () {
  var text = $(this).closest('tr').find(".attackerCapability").text();
  $(this).closest("tr").remove();
  var attacker = JSON.parse($.session.get("Attacker"));
  var theEnvName = $.session.get("attackerEnvironmentName");
  $.each(attacker.theEnvironmentProperties, function (index, env) {
    if(env.theEnvironmentName == theEnvName){
      $.each(env.theCapabilities, function (index2, cap) {
        if(cap.name == text){
          env.theCapabilities.splice( index2 ,1 );
          $.session.set("Attacker", JSON.stringify(attacker));
          return false;
        }
      });
    }
  });
});

$(document).on('click', 'td.deleteAttackerButton', function (e) {
  e.preventDefault();
  var attackerName = $(this).find('i').attr("value");
  deleteObject('attacker',attackerName,function(attackerName) {
    $.ajax({
      type: "DELETE",
      dataType: "json",
      contentType: "application/json",
      accept: "application/json",
      crossDomain: true,
      processData: false,
      origin: serverIP,
      url: serverIP + "/api/attackers/name/" + attackerName.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
      success: function (data) {
        createAttackersTable();
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




var uploading = false;
$("#objectViewer").on('click', '#theAttackerImage', function () {
  if(!uploading) {
    $('#fileupload').trigger("click");
  }
});

$("#objectViewer").on('change','#fileupload', function () {
  uploading = true;
  var test = $(document).find('#fileupload');
  var fd = new FormData();
  fd.append("file", test[0].files[0]);
  var bar = $(".progress-bar");
  var outerbar = $(".progress");
  bar.css("width", 0);
  outerbar.show("slide", { direction: "up" }, 750);

  $.ajax({
    type: "POST",
    accept: "application/json",
    processData:false,
    contentType:false,
    data: fd,
    crossDomain: true,
    url: serverIP + "/api/upload/image?session_id="+  String($.session.get('sessionID')),
    success: function (data) {
      outerbar.hide("slide", { direction: "down" }, 750);
      uploading = false;
      data = JSON.parse(data);
      updateAttackerImage(data.filename, getImagedir(data.filename));
    },
    error: function (xhr, textStatus, errorThrown) {
      uploading = false;
      outerbar.hide("slide", { direction: "down" }, 750);
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    },
    xhr: function() {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function(evt) {
        if (evt.lengthComputable) {
          var percentComplete = evt.loaded / evt.total;
          percentComplete = (percentComplete) * outerbar.width();
          bar.css("width", percentComplete)
        }
      }, false);
      return xhr;
    }
  });
});

function updateAttackerImage(imagedir, actualDir) {
  var attacker = JSON.parse($.session.get("Attacker"));
  attacker.theImage = imagedir;
  $("#theAttackerImage").attr("src", actualDir);
  rescaleImage($("#theAttackerImage"),200);
  $.session.set("Attacker", JSON.stringify(attacker));
}

function appendAttackerEnvironment(environment){
  $("#theAttackerEnvironments").find("tbody").append('<tr><td class="deleteAttackerEnv"><i class="fa fa-minus"></i></td><td class="attackerEnvironment">'+environment+'</td></tr>');
}
function appendAttackerRole(role){
  $("#attackerRole").find("tbody").append("<tr><td class='removeAttackerRole'><i class='fa fa-minus'></i></td><td class='attackerRole'>" + role + "</td></tr>").animate('slow');
}
function appendAttackerMotive(motive){
  $("#attackerMotive").find("tbody").append("<tr><td class='removeAttackerMotive' ><i class='fa fa-minus'></i></td><td class='attackerMotive'>" + motive + "</td></tr>").animate('slow');
}
function appendAttackerCapability(prop){
  $("#attackerCapability").find("tbody").append("<tr class='changeCapability'><td class='removeAttackerCapability'><i class='fa fa-minus'></i></td><td class='attackerCapability'>" + prop.name + "</td><td>"+ prop.value +"</td></tr>").animate('slow');
}
function clearAttackerEnvInfo(){
  $("#attackerCapability").find("tbody").empty();
  $("#attackerMotive").find("tbody").empty();
  $("#attackerRole").find("tbody").empty();
}

mainContent.on('click', '#CloseAttacker', function (e) {
  e.preventDefault();
  createAttackersTable();
});

function motivationDialogBox(hasMotive ,callback){
  var dialogwindow = $("#ChooseMotivationsDialog");
  var select = dialogwindow.find("select");
  $.ajax({
    type: "GET",
    dataType: "json",
    accept: "application/json",
    data: {
      session_id: String($.session.get('sessionID'))
    },
    crossDomain: true,
    url: serverIP + "/api/attackers/motivations",
    success: function (data) {
      select.empty();
      var none = true;
      $.each(data, function(index, motive) {
        var found = false;
        $.each(hasMotive,function(index, text) {
          if(text == motive.theName){
            found = true
          }
        });
        //if not found in assets
        if(!found) {
          select.append("<option value=" + motive.theName + ">" + motive.theName + "</option>");
          none = false;
        }
      });
      if(!none) {
        dialogwindow.dialog({
          modal: true,
          buttons: {
            Ok: function () {
              var text =  select.find("option:selected" ).text();
              if(jQuery.isFunction(callback)){
                callback(text);
              }
              $(this).dialog("close");
            }
          }
        });
        $(".comboboxD").css("visibility", "visible");
      }
      else {
        alert("All possible attackers are already added");
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function putAttacker(attacker, oldName, usePopup, callback){
  var output = {};
  output.object = attacker;
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
    url: serverIP + "/api/attackers/name/" + oldName.replace(" ","%20") + "?session_id=" + $.session.get('sessionID'),
    success: function (data) {
      if(usePopup) {
        showPopup(true);
      }
      if(jQuery.isFunction(callback)){
        callback();
      }
    },
    error: function (xhr, textStatus, errorThrown) {
      if(usePopup) {
        var error = JSON.parse(xhr.responseText);
        showPopup(false, String(error.message));
      }
      debugLogger(String(this.url));
      debugLogger("error: " + xhr.responseText +  ", textstatus: " + textStatus + ", thrown: " + errorThrown);
    }
  });
}

function postAttacker(attacker, callback){
  var output = {};
  output.object = attacker;
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
    url: serverIP + "/api/attackers" + "?session_id=" + $.session.get('sessionID'),
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
