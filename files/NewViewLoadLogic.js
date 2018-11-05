function RedirectToUrl() {
  var objRedirectToUrl = $("#RedirectToUrl");

  if (objRedirectToUrl.length > 0 && objRedirectToUrl.val() != "") {
    document.location = objRedirectToUrl.val();
  }
}

function GetParameterByName(name, url) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(url == undefined || url == "" ? location.href : url);
  return results == null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function HtmlEncode(value) {
  return $("<div/>")
    .text(value)
    .html();
}

function HtmlDecode(value) {
  return $("<div/>")
    .html(value)
    .text();
}

function SetSubmitVariables(action, controller, id) {
  var currentlyInView = $("#hidIsNewLayout").length > 0;
  _action = action;
  _controller = controller;
  _arguments = GetInputValuesAsJson(id, currentlyInView);
}

function SendRequest(action, controller, args) {
  document.location.href =
    GetRootVirtaulPath(controller + "/" + action) +
    "?" +
    ConvertToQueryStringFromJsonString(args);
}

function DownloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  link.click();
}

function SendExportRequest(action, controller, args) {
  if (args.length > _urlQueryStringLength) {
    $.ajax({
      type: "POST",
      url: GetRootVirtaulPath("Common" + "/" + "SaveExportDataInSession"),
      data: { sessionData: args },
      success: function(data) {
        SendRequest(
          action,
          controller,
          $.toJSON({ IsGetQueryStringFromSetting: true })
        );
      }
    });
  } else {
    SendRequest(action, controller, args);
  }
}

function DetailPrint(action, controller, args) {
  var targetUrl =
    GetRootVirtaulPath(controller + "/" + action) +
    "?" +
    ConvertToQueryStringFromJsonString(args);
  var winSettings =
    "center:yes;resizable:yes;dialogWidth:1080px;dialogHeight:800px";
  window.showModalDialog(targetUrl, null, winSettings);
}

//Use for implement BodyPartial CallBackPanel dynamic callback.
function cbpBody_OnBeginCallback(s, e) {
  try {
    e.customArgs["action"] = _action;
    e.customArgs["controller"] = _controller;

    if (_arguments != "") {
      var hidCallBackByJson = $("#hidCallBackByJson");
      if (hidCallBackByJson.length > 0) {
        e.customArgs["jsonString"] = _arguments;
      } else {
        var reg = new RegExp("\t", "gmi");
        var args = $.parseJSON(_arguments.replace(reg, "\\t"));
        $.each(args, function(key, value) {
          e.customArgs[key] = value;
        });
      }
    }

    //Handle the cf for request template function.
    if (
      _controller == "RequestTemplate" &&
      (_action == "Save" || _action == "PageCallBack")
    ) {
      var customFieldsToShow = "";
      $("input[name^='CustomFields_cb_']").each(function() {
        var obj = $(this);
        var controlName = obj.attr("name");
        var devControl = GetDevObjByName(controlName);
        if (devControl.GetChecked() == true) {
          customFieldsToShow += controlName.split("_")[2] + ",";
        }
      });
      e.customArgs["RequestTemplate.CustomFieldsToShow"] = customFieldsToShow;
    }

    //Handle the cf for purchase order template function.
    if (
      _controller == "PurchaseOrderTemplate" &&
      (_action == "Save" || _action == "PageCallBack")
    ) {
      var customFieldsToShow = "";
      $("input[name^='CustomFields_cb_']").each(function() {
        var obj = $(this);
        var controlName = obj.attr("name");
        var devControl = GetDevObjByName(controlName);
        if (devControl.GetChecked() == true) {
          customFieldsToShow += controlName.split("_")[2] + ",";
        }
      });
      e.customArgs[
        "PurchaseOrderTemplate.CustomFieldsToShow"
      ] = customFieldsToShow;
    }

    if (
      _controller == "AssetTemplate" &&
      (_action == "Save" || _action == "PageCallBack")
    ) {
      var customFieldsToShow = "";
      $("input[name^='CustomFields_cb_']").each(function() {
        var obj = $(this);
        var controlName = obj.attr("name");
        var devControl = GetDevObjByName(controlName);
        if (devControl.GetChecked() == true) {
          customFieldsToShow += controlName.split("_")[2] + ",";
        }
      });
      e.customArgs["AssetTemplate.CustomFieldsToShow"] = customFieldsToShow;
    }

    //Handle the cf for work order template function.
    if (
      _controller == "WorkOrderTemplate" &&
      (_action == "Save" || _action == "PageCallBack")
    ) {
      var customFieldsToShow = "";
      $("input[name^='CustomFields_cb_']").each(function() {
        var obj = $(this);
        var controlName = obj.attr("name");
        var devControl = GetDevObjByName(controlName);
        if (devControl.GetChecked() == true) {
          customFieldsToShow += controlName.split("_")[2] + ",";
        }
      });
      e.customArgs["WorkOrderTemplate.CustomFieldsToShow"] = customFieldsToShow;
    }

    //Handle the cf for work order template function.
    if (
      _controller == "PartTemplate" &&
      (_action == "Save" || _action == "PageCallBack")
    ) {
      var customFieldsToShow = "";
      $("input[name^='CustomFields_cb_']").each(function() {
        var obj = $(this);
        var controlName = obj.attr("name");
        var devControl = GetDevObjByName(controlName);
        if (devControl.GetChecked() == true) {
          customFieldsToShow += controlName.split("_")[2] + ",";
        }
      });
      e.customArgs["PartTemplate.CustomFieldsToShow"] = customFieldsToShow;
    }

    if (_action == "DeleteInTask") {
      var hidIdWithName = $("#hidIdWithName");
      if (hidIdWithName.length > 0) {
        e.customArgs["idWithName"] = hidIdWithName.val();
      }
    }

    //Handle the HtmlEditor's html data.
    var htmlEditors = $("#hidHtmlEditors");

    if (htmlEditors.length > 0) {
      var values = $.parseJSON(htmlEditors.val());
      $.each(values, function(key, value) {
        if (GetDevObjByName(key)) {
          e.customArgs[value] = HtmlEncode(GetDevObjByName(key).GetHtml());
        }
      });
    }

    if (needToClearSort) {
      e.customArgs["needToClearSort"] = needToClearSort;
      needToClearSort = false;
    }
  } catch (ex) {
    console.log(ex);
  }
}

function cbpBody_OnEndCallback(s, e) {
  try {
    RedirectToUrl();
    RedirectAction();

    var splManagement = $("#splTreeViewManagement");
    if (splManagement.length != 0) {
      _hasSplTreeViewManagement = true;
    } else {
      _hasSplTreeViewManagement = false;
    }

    var isActionReturned = $.cookie("Zion_IsActionReturned" + clientKey);

    var directToView = "";

    if (isActionReturned == "True") {
      SetHistoryWithQueryString(
        $.cookie("Zion_Action" + clientKey),
        $.cookie("Zion_Controller" + clientKey),
        directToView,
        $.cookie("Zion_QueryString" + clientKey)
      );
    }

    $(function() {
      $("#cbpBody .action-bar:first").smartFloat();
      if ($(".grid-stack").length > 0) {
        $(".grid-stack").gridstack({
          cell_height: 48,
          always_show_resize_handle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ),
          resizable: {
            handles: "e, se, s, sw, w"
          }
        });
        gridstack = $(".grid-stack").data("gridstack");
        gridstack.movable(".grid-stack-item", false);
        gridstack.resizable(".grid-stack-item", false);
      }
    });

    WidgetsPanelCallback();

    initializeControls();
  } catch (ex) {
    console.log(ex);
  }
}

function InitDragPopupEdit() {
  var cookie_Zion_Controller = $.cookie("Zion_Controller" + clientKey);
  var cookie_Zion_Action = $.cookie("Zion_Action" + clientKey);
  var cookie_Zion_QueryString = $.cookie("Zion_QueryString" + clientKey);
  DragPopup.destroy({
    currentController: cookie_Zion_Controller,
    currentAction: cookie_Zion_Action
  });
  var initQuickEdit = false;
  if (cookie_Zion_Controller == "WorkOrder") {
    if (
      cookie_Zion_Action == "Edit" ||
      cookie_Zion_Action == "Details" ||
      cookie_Zion_Action == "WOSafetyPrograms" ||
      cookie_Zion_Action == "WOSafetyProgramsView"
    ) {
      initQuickEdit = true;
    }
  } else if (cookie_Zion_Controller == "PMProcedure") {
    if (
      cookie_Zion_Action == "Edit" ||
      cookie_Zion_Action == "Details" ||
      cookie_Zion_Action == "PMSafetyPrograms" ||
      cookie_Zion_Action == "PMSafetyProgramsView"
    ) {
      initQuickEdit = true;
    }
  } else if (cookie_Zion_Controller == "Asset") {
    if (
      cookie_Zion_Action == "Edit" ||
      cookie_Zion_Action == "Details" ||
      cookie_Zion_Action == "AssetMeterTitles" ||
      cookie_Zion_Action == "PartConsumers"
    ) {
      initQuickEdit = true;
    } else if (
      cookie_Zion_Action == "MeterReadingBatchCreate" &&
      !IsMutilId(cookie_Zion_QueryString)
    ) {
      initQuickEdit = true;
    }
  } else if (cookie_Zion_Controller == "Part") {
    if (
      cookie_Zion_Action == "Edit" ||
      cookie_Zion_Action == "Details" ||
      cookie_Zion_Action == "PartConsumers"
    ) {
      initQuickEdit = true;
    }
  } else if (cookie_Zion_Controller == "PurchaseOrder") {
    if (
      cookie_Zion_Action == "Edit" ||
      cookie_Zion_Action == "Details" ||
      cookie_Zion_Action == "POItemManagement"
    ) {
      initQuickEdit = true;
    }
  } else if (
    cookie_Zion_Controller == "WOLabor" ||
    cookie_Zion_Controller == "WOPart"
  ) {
    initQuickEdit = true;
  }

  if (initQuickEdit) {
    var linkId = location.href.substring(
      location.href.indexOf("?") + 1,
      location.href.indexOf("=")
    );
    DragPopup.init({
      popContentData: JSON.parse($.cookie("Zion_QuickEdit" + clientKey)),
      currentId: GetParameterByName(linkId),
      currentController: cookie_Zion_Controller,
      currentAction: cookie_Zion_Action,
      currentLinkId: linkId,
      directToView: $("#hidIsNewLayout").val() || ""
    });
  }
}

/*select2 dropdown start*/
function SelectTwo(el) {
  $this = el;
  $this.on("select2-open", function() {
    $(".wrapper-dropdown").removeClass("active");
  });
}
/*select2 dropdown end*/

/*smartFloat start*/
$.fn.smartFloat = function() {
  var position = function(element) {
    var top = element.position().top;
    var headerHeight = $(window).width() > 960 ? 65 : 49;
    var pos = element.css("position");
    $(".v-content__wrap").scroll(function() {
      var scrolls = $(this).scrollTop();
      if (scrolls > top - headerHeight) {
        if (window.XMLHttpRequest) {
          element
            .css({
              position: "fixed",
              top: headerHeight
            })
            .addClass("shadow");
          element.css("width", "calc(100vw - 80px)");

          if ($("#hidIsNewLayout").length) {
            element.css("max-width", $(".layoutNew").width());
          } else {
            element.css("max-width", $("#cbpBody").width());
          }
        } else {
          element.css({
            top: scrolls
          });
        }
      } else {
        element
          .css({
            position: pos,
            top: top
          })
          .removeClass("shadow");
        element.css("width", "");
        element.css("max-width", "");
      }
    });
  };
  return $(this).each(function() {
    position($(this));
  });
};

function DisplayMoreUserInfoPopup() {
  var shouldDisplay;

  if ($("#hidIsNewLayout").length) {
    shouldDisplay =
      $("#hidIsMessageLoading").val() != "True" &&
      $("#hidUserEmailAndQuestionAndAnswerRequired")
        .val()
        .toLowerCase() == "true";
  } else {
    shouldDisplay =
      $("#hidIsMessageLoading").val() != "True" &&
      ($("#hidIsLoading").val() == "True" ||
        $("#hidIsLoading").val() == undefined) &&
      $("#hidUserEmailAndQuestionAndAnswerRequired")
        .val()
        .toLowerCase() == "true";
  }

  if (shouldDisplay) {
    $("#hidIsLoading").val("");
    $("#hidIsMessageLoading").val("");
    popNeedMoreUserInfo.Show();
  }
}

function WidgetsPanelCallback() {
  if (_hasLeftPanelNoCallback == false) {
    var widgets = GetDevObjByName("cbpWidgets");
    if (widgets != null) {
      widgets.PerformCallback();
    }
  } else {
    _hasLeftPanelNoCallback = false;
  }
}

var Source = {
  AssetSource: "SourceAssetsJsonString",
  SiteSource: "SourceSitesJsonString",
  LocationSource: "SourceLocationsJsonString",
  MRSource: "SourceMeterTitlesJsonString",
  AssignedToUsers: "AssignedToUsersJsonString",

  Asset_OnBeginCallBack: function(s, e, hidName) {
    SourceAssetGridView_OnBeginCallback(s, e, hidName);
    e.customArgs["sourceAssetsJsonString"] = $(
      'input[name="' + Source.AssetSource + '"]'
    ).val();
  },

  Site_OnBeginCallBack: function(s, e, hidName, hasSite) {
    SourceSiteGridView_OnBeginCallback(s, e, hidName, hasSite);
    e.customArgs["sourceSitesJsonString"] = $(
      'input[name="' + Source.SiteSource + '"]'
    ).val();
  },

  Location_OnBeginCallBack: function(s, e, hidName) {
    gdvSourceLocations_OnBeginCallback(s, e);
    e.customArgs["sourceLocationsJsonString"] = $(
      'input[name="' + Source.LocationSource + '"]'
    ).val();
  },

  Add: function(arr, idName, sourceName) {
    var source = $('input[name="' + sourceName + '"]');
    if (source.length == 0) {
      return;
    }
    var all = $.parseJSON(source.val());

    for (var i = 0; i < arr.length; i++) {
      var obj = {};
      obj[idName] = arr[i].id;
      obj["EstimatedHours"] = 0;
      all.push(obj);
    }

    source.val($.toJSON(all));
  },

  Delete: function(id, type, totalEstimatedHoursControlName, estimatedByName) {
    var sourceName = "";
    var idName = "";

    switch (type) {
      case "asset":
        sourceName = Source.AssetSource;
        idName = "AssetId";
        break;

      case "location":
        sourceName = Source.LocationSource;
        idName = "LocationId";
        break;

      case "site":
        sourceName = Source.SiteSource;
        idName = "SiteId";
        break;

      case "metertitle":
        sourceName = Source.MRSource;
        idName = "MeterTitleId";
        break;
    }

    var source = $('input[name="' + sourceName + '"]');
    if (source.length == 0) {
      return;
    }

    var all = $.parseJSON(source.val());
    if (type != "metettitle") {
      all = RemoveArr(all, idName, id);
      source.val($.toJSON(all));
    }

    var estimatedBy = GetDevObjByName(estimatedByName);
    if (estimatedBy == null) {
      return;
    }

    switch (estimatedBy.GetValue()) {
      case "1": // source
        {
          var totalEstimatedHours = 0;
          for (var i = 0; i < all.length; i++) {
            totalEstimatedHours += all[i].EstimatedHours;
          }
          Source.SetTotal(totalEstimatedHoursControlName, totalEstimatedHours);
        }
        break;
    }
  },

  EstimatedHours_NumberChanged: function(
    s,
    e,
    id,
    idName,
    sourceName,
    totalEstimatedHoursControlName
  ) {
    var source = $('input[name="' + sourceName + '"]');
    var all = $.parseJSON(source.val());
    var newAll = [];
    var totalEstimatedHours = 0;
    for (var i = 0; i < all.length; i++) {
      if (all[i][idName] == id) {
        all[i].EstimatedHours = s.GetNumber();
      }
      newAll.push(all[i]);
      totalEstimatedHours +=
        all[i].EstimatedHours == undefined ? 0 : all[i].EstimatedHours;
    }
    source.val($.toJSON(newAll));
    Source.SetTotal(totalEstimatedHoursControlName, totalEstimatedHours);
  },

  SetTotal: function(ctrlName, total) {
    if (GetDevObjByName(ctrlName)) {
      GetDevObjByName(ctrlName).SetValue(total);
    } else {
      $('input[name="' + ctrlName + '"]').val(ctrlName);
    }
  },

  SetUserEstimatedHours: function(usergvName, sourcegvName, sourceType) {
    var sourcegv = GetDevObjByName(sourcegvName);
    if (sourcegv != null) {
      for (var i = 0; i < sourcegv.pageRowCount; i++) {
        var rowIdx = sourcegv.GetPageIndex() * sourcegv.pageRowSize + i;
        var row = sourcegv.GetRow(rowIdx);
        if (row != null) {
          var hours = GetDevObjByName(
            "Source" + sourceType + "[" + rowIdx + "].EstimatedHours"
          );
          if (hours != null) {
            hours.SetNumber(0);
            hours.SetEnabled(false);
          }
        }
      }
    }

    var source = $('input[name="Source' + sourceType + 'JsonString"]');
    var all = $.parseJSON(source.val());

    for (var h = 0; h < all.length; h++) {
      all[h]["EstimatedHours"] = 0;
    }
    source.val($.toJSON(all));

    var usergv = GetDevObjByName(usergvName);
    if (usergv != null) {
      for (var u = 0; u < usergv.pageRowCount; u++) {
        var idx = usergv.GetPageIndex() * usergv.pageRowSize + u;
        var rowUser = usergv.GetRow(idx);
        if (rowUser != null) {
          var uHours = GetDevObjByName(
            "UserIdMapIndexs[" + idx + "].EstimatedHours"
          );
          if (uHours != null) {
            uHours.SetEnabled(true);
          }
        }
      }
    }
  },

  SetSourceEstimatedHours: function(usergvName, sourcegvName, sourceType) {
    var sourcegv = GetDevObjByName(sourcegvName);
    if (sourcegv != null) {
      for (var i = 0; i < sourcegv.pageRowCount; i++) {
        var rowIdx = sourcegv.GetPageIndex() * sourcegv.pageRowSize + i;
        var row = sourcegv.GetRow(rowIdx);
        if (row != null) {
          var hours = GetDevObjByName(
            "Source" + sourceType + "[" + rowIdx + "].EstimatedHours"
          );
          if (hours != null) {
            hours.SetEnabled(true);
          }
        }
      }
    }

    var user = $('input[name="AssignedToUsersJsonString"]');
    var all = $.parseJSON(user.val());

    for (var h = 0; h < all.length; h++) {
      all[h]["EstimatedHours"] = 0;
    }
    user.val($.toJSON(all));

    var usergv = GetDevObjByName(usergvName);
    if (usergv != null) {
      for (var u = 0; u < usergv.pageRowCount; u++) {
        var idx = usergv.GetPageIndex() * usergv.pageRowSize + u;
        var rowUser = usergv.GetRow(idx);
        if (rowUser != null) {
          var uHours = GetDevObjByName(
            "UserIdMapIndexs[" + idx + "].EstimatedHours"
          );
          if (uHours != null) {
            uHours.SetNumber(0);
            uHours.SetEnabled(false);
          }
        }
      }
    }
  },

  SetHoursEnable: function(s, e, usergvName, sourceTypeName, estimatedByName) {
    var sourceType = GetDevObjByName(sourceTypeName);
    var sourceTypeVal = "";

    if (sourceType == null) {
      sourceType = $('input[name="' + sourceTypeName + '"]');
      if (sourceType.length == 0) {
        return;
      }
      sourceTypeVal = sourceType.val();
    } else {
      sourceTypeVal = sourceType.GetValue();
    }

    var sourceInfo = Source.GetSourceInfo(sourceTypeVal);

    if (sourceInfo.gv == "") {
      return;
    }

    var estimatedBy = GetDevObjByName(estimatedByName);
    if (estimatedBy == null) {
      return;
    }

    var estimatedByVal = estimatedBy.GetValue();

    switch (estimatedByVal) {
      case "0": // user, set source's hours disabled.
        {
          var sourcegv = GetDevObjByName(sourceInfo.gv);
          if (sourcegv != null) {
            for (var i = 0; i < sourcegv.pageRowCount; i++) {
              var rowIdx = sourcegv.GetPageIndex() * sourcegv.pageRowSize + i;
              var row = sourcegv.GetRow(rowIdx);
              if (row != null) {
                var hours = GetDevObjByName(
                  "Source" + sourceInfo.text + "[" + rowIdx + "].EstimatedHours"
                );
                if (hours != null) {
                  hours.SetEnabled(false);
                }
              }
            }
          }
        }
        break;

      case "1": // source, set user's hours disabled.
        {
          var usergv = GetDevObjByName(usergvName);
          if (usergv != null) {
            for (var u = 0; u < usergv.pageRowCount; u++) {
              var idx = usergv.GetPageIndex() * usergv.pageRowSize + u;
              var rowUser = usergv.GetRow(idx);
              if (rowUser != null) {
                var uHours = GetDevObjByName(
                  "UserIdMapIndexs[" + idx + "].EstimatedHours"
                );
                if (uHours != null) {
                  uHours.SetEnabled(false);
                }
              }
            }
          }
        }
        break;
    }
  },

  GetSourceInfo: function(sourceType) {
    var info = {
      gv: "",
      text: ""
    };

    switch (sourceType) {
      case "1": // site
        {
          info.gv = "SourceSiteGridView";
          info.text = "Sites";
        }
        break;

      case "2": // location
        {
          info.gv = "gdvSourceLocations";
          info.text = "Locations";
        }
        break;

      case "3": // Asset
        {
          info.gv = "SourceAssetGridView";
          info.text = "Assets";
        }
        break;

      case "4": // MeterTitle
        {
          info.gv = "gdvSourceMeterTitles";
          info.text = "MeterTitles";
        }
        break;
    }

    return info;
  },

  EstimateBy_SelectIndexChanged: function(
    s,
    e,
    usergvName,
    sourceType,
    totalEstimatedHoursControlName
  ) {
    var estimatedBy = s.GetValue();
    var sourceInfo = Source.GetSourceInfo(sourceType);

    if (sourceInfo.gv == "") {
      return;
    }

    switch (estimatedBy) {
      case "0": // user
        {
          Source.SetUserEstimatedHours(
            usergvName,
            sourceInfo.gv,
            sourceInfo.text
          );
        }
        break;

      case "1": // source
        {
          Source.SetSourceEstimatedHours(
            usergvName,
            sourceInfo.gv,
            sourceInfo.text
          );
        }
        break;
    }

    Source.SetTotal(totalEstimatedHoursControlName, 0);
  }
};

function ToolbarItemSummaryImport(importForType) {
  popImportSettingEditor.Show();
  $("#ImportForType").val(importForType);
}

function ViewCallBack(action, controller, containerId) {
  SetSubmitVariables(action, controller, containerId);
  BodyPanelCallback(action, controller, containerId);
}

function PerformCallback() {
  var hidCallbackParams = $("#hidCallbackParams");
  if (hidCallbackParams.length != 0) {
    var callbackParams = $.parseJSON(hidCallbackParams.val());
    if (
      callbackParams.Controller != null &&
      callbackParams.Action != null &&
      callbackParams.Container != null
    ) {
      ViewCallBack(
        callbackParams.Action,
        callbackParams.Controller,
        callbackParams.Container
      );
    }
  }
}

function HtmlEditorLostFocus(s, e) {
  var attrIsRequired = s.mainElement.getAttribute("IsRequired");
  if (attrIsRequired != null) {
    var htmlValue = s.GetHtml();
    var attrRequired = s.mainElement.getAttribute("RequiredControl");

    if (attrRequired != null) {
      var requiredControl = $("#" + attrRequired);
      if (requiredControl.length > 0) {
        if (htmlValue == "") {
          requiredControl.show();
        } else {
          requiredControl.hide();
        }
      }
    }
  }
}

function HtmlEditorValidate(htmlName) {
  var htmlControl = GetDevObjByName(htmlName);
  if (htmlControl != null) {
    var attrIsRequired = htmlControl.mainElement.getAttribute("IsRequired");
    if (attrIsRequired != null) {
      var htmlValue = htmlControl.GetHtml();

      if (htmlValue == "") {
        var attrRequired = htmlControl.mainElement.getAttribute(
          "RequiredControl"
        );
        if (attrRequired != null) {
          var requiredControl = $("#" + attrRequired);
          if (requiredControl.length > 0) {
            requiredControl.show();
            return false;
          }
        }
      }
    }
  }

  return true;
}

var SolutionPicker = {
  popName: "popupSolutionPicker",
  gridName: "popSolutionPickerGridView",
  causeId: "",
  problemId: "",

  WOActionClick: function() {
    var objCause = GetDevObjByName("WorkOrder.CauseId");
    var objProblem = GetDevObjByName("WorkOrder.ProblemId");
    if (objCause == null) {
      var hidCause = $('input[name="WorkOrder.CauseId"]');
      if (hidCause.length > 0) {
        this.causeId = hidCause.val();
      }
    } else {
      this.causeId = objCause.GetValue();
    }

    if (objProblem == null) {
      var hidProblem = $('input[name="WorkOrder.ProblemId"]');
      if (hidProblem.length > 0) {
        this.problemId = hidProblem.val();
      }
    } else {
      this.problemId = objProblem.GetValue();
    }

    PopupWindowShow(this.popName);
  },

  OnBeginCallback: function(s, e) {
    var filter = {
      CauseId: this.causeId,
      ProblemId: this.problemId
    };

    e.customArgs["filter"] = $.toJSON(filter);
  },

  GridView_OnSelectButtonClick: function(id, name, description) {
    var objPickerForType = $("#hidSolutionPickerForType");

    if (objPickerForType != null) {
      var type = objPickerForType.val();

      switch (type) {
        case "WOAction":
          var woAction = GetDevObjByName("hedWorkOrderAction");
          woAction.SetHtml(unescape(description));
          break;
      }
    }

    var pop = GetDevObjByName(this.popName);
    if (pop != null) {
      pop.Hide();
    }
  }
};

function GetQueryStringByName(name, qstring) {
  qstring = unescape(qstring);
  var result = qstring.match(new RegExp(name + "=([^&]+)", "i"));
  if (result == null || result.length < 1) {
    return "";
  }
  return result[1];
}

function IsMutilId(qstring) {
  var query = GetQueryStringByName("assetId", qstring);

  if (query == "") return false;

  return query.split(",").length > 1;
}

var assetDepreciation = {
  assetId: 0,
  popNameSuffix: "popAssetDepreciation_",
  gvName: "AssetDepreciationGridView",

  Show: function(args) {
    var salvageValue = GetDevObjByName("Asset.SalvageValue").GetValue();
    var lifeTime = GetDevObjByName("Asset.LifeTime").GetValue();
    var purchaseDate = GetDevObjByName("Asset.PurchaseDate").GetDate();
    var purchasePrice = GetDevObjByName("Asset.PurchasePrice").GetValue();

    if (salvageValue == null) {
      return;
    }

    if (lifeTime == null || lifeTime === 0) {
      return;
    }

    if (purchaseDate == null) {
      return;
    }

    if (purchasePrice == null || purchasePrice === 0) {
      return;
    }

    var customArgs = $.parseJSON(args);
    this.assetId = customArgs.assetId;

    var popupControl = GetDevObjByName(this.popNameSuffix + customArgs.assetId);
    popupControl.Show();

    if (popupControl.InCallback() === false) {
      popupControl.PerformCallback();
    }
  },

  IsShow: function(s, e, id) {
    var salvageValue = GetDevObjByName("Asset.SalvageValue").GetValue();
    var lifeTime = GetDevObjByName("Asset.LifeTime").GetValue();
    var purchaseDate = GetDevObjByName("Asset.PurchaseDate").GetDate();
    var purchasePrice = GetDevObjByName("Asset.PurchasePrice").GetValue();
    var isShow = true;

    if (salvageValue == null) {
      isShow = false;
    }

    if (lifeTime == null || lifeTime === 0) {
      isShow = false;
    }

    if (purchaseDate == null) {
      isShow = false;
    }

    if (purchasePrice == null || purchasePrice === 0) {
      isShow = false;
    }

    var imgName = "imgAssetDepreciation_" + id;
    var $img = $("#" + imgName);
    if ($img.length === 0) {
      return;
    }

    var attrImgrc = $img.attr("imgsrc");
    var imageSrc = $.parseJSON(attrImgrc);

    if (isShow) {
      $img.attr("src", imageSrc.src);
    } else {
      $img.attr("src", imageSrc.disablesrc);
    }
  },

  Pop_OnBeginCallback: function(s, e) {
    var salvageValue = GetDevObjByName("Asset.SalvageValue");
    var lifeTime = GetDevObjByName("Asset.LifeTime");
    var purchaseDate = GetDevObjByName("Asset.PurchaseDate");
    var purchasePrice = GetDevObjByName("Asset.PurchasePrice");

    e.customArgs["SalvageValue"] = salvageValue.GetValue();
    e.customArgs["LifeTime"] = lifeTime.GetValue();
    var date = ConvertToLocalDateTime(purchaseDate.GetDate());
    e.customArgs["PurchaseDate"] = date;
    e.customArgs["PurchasePrice"] = purchasePrice.GetValue();
  },

  GridView_OnBeginCallback: function(s, e) {
    var salvageValue = GetDevObjByName("Asset.SalvageValue");
    var lifeTime = GetDevObjByName("Asset.LifeTime");
    var purchaseDate = GetDevObjByName("Asset.PurchaseDate");
    var purchasePrice = GetDevObjByName("Asset.PurchasePrice");

    e.customArgs["SalvageValue"] = salvageValue.GetValue();
    e.customArgs["LifeTime"] = lifeTime.GetValue();
    var date = ConvertToLocalDateTime(purchaseDate.GetDate());
    e.customArgs["PurchaseDate"] = date;
    e.customArgs["PurchasePrice"] = purchasePrice.GetValue();
  },

  Ok_OnClick: function(s, e) {
    var cbxAssetDepreciationExportType = GetDevObjByName(
      "cbxAssetDepreciationExportType"
    );
    var gv = GetDevObjByName(assetDepreciation.gvName);

    var jsonParam = {
      Id: assetDepreciation.assetId,
      typeName: cbxAssetDepreciationExportType.GetValue()
    };

    var salvageValue = GetDevObjByName("Asset.SalvageValue");
    var lifeTime = GetDevObjByName("Asset.LifeTime");
    var purchaseDate = GetDevObjByName("Asset.PurchaseDate");
    var purchasePrice = GetDevObjByName("Asset.PurchasePrice");
    var date = ConvertToLocalDateTime(purchaseDate.GetDate());

    var data = {
      SalvageValue: salvageValue.GetValue(),
      LifeTime: lifeTime.GetValue(),
      PurchaseDate: date,
      PurchasePrice: purchasePrice.GetValue()
    };

    jsonParam["FilterExpression"] = $.toJSON(data);
    SendRequest("ExportAssetDepreciation", "Asset", $.toJSON(jsonParam));
  },

  Cancel_OnClick: function(s, e) {
    var pop = GetDevObjByName(
      assetDepreciation.popNameSuffix + assetDepreciation.assetId
    );
    if (pop != null) {
      pop.Hide();
    }
  }
};

function AddItemToArrayString(item, arrayString, separator) {
  var array = arrayString == "" ? new Array() : arrayString.split(separator);

  var duplicateIndex = $.inArray(item, array, 0);

  if (duplicateIndex == -1) {
    array.push(item);
  }

  return array.join(separator);
}

function ToolbarItemPartConsumerSubmit(args) {
  var action = args[0];
  var controller = args[1];
  var params = args[2];
  var hidName = args[3];
  var directToView = args[4];

  var objHidName = $("#" + hidName);

  if (objHidName.length == 0) return;

  var arguments = $.parseJSON(params);

  var data = {
    relatedIds: objHidName.val(),
    id: arguments.id
  };

  $.ajax({
    url: GetRootVirtaulPath(controller + "/" + action),
    type: "post",
    data: data,
    success: function(result) {
      ShowAlertPopup(result.msg, function() {
        SetNavVariables("Management", controller, directToView);
      });
    },
    statusCode: {
      500: function(result) {
        ShowAlertPopup(result.statusText);
      }
    }
  });
}

function WindowPopup(args) {
  var jsonObj = $.parseJSON(args);
  var action = jsonObj.Action;
  var controller = jsonObj.Controller;
  var id = jsonObj.Id;
  var header = jsonObj.Header;
  var jsonParam = { id: id };
  var pop = GetDevObjByName("TrendAnalysisReport");
  ShowReportPop(pop, 1080, 800, header, action, controller, jsonParam);
}

ButtonCallBackEvent.DeleteCallBack = function(options) {
  ImageMapping.RemoveAllPushpin();
};

var ImageMapping = (function() {
  var isEdit = false;
  var hasEdit = false;
  var draggies = {};
  var my = {};
  var jsonData = {};
  var deleteFlag = false;
  var currentImageColorIndex = 0;
  var imageColors = ["red", "orange", "yellow", "green", "blue", "purple"];
  var pushpinsImageJson = {};

  function getPushpinImages() {
    var pushpinImages = {};
    for (var index in imageColors) {
      pushpinImages[imageColors[index]] = GetWebSiteVirtualPathWithoutClientId(
        "Content/Images/icoPushpin_" + imageColors[index] + ".png"
      );
    }

    return pushpinImages;
  }

  function disableBtn($btn) {
    $btn.attr("disabled", "disabled");
  }

  function enableBtn($btn) {
    $btn.removeAttr("disabled");
  }

  function createPushpinsImageJson() {
    var i,
      len = 0;
    var photoShape = $("#photoShape").val();
    var photoShapeJson;
    if (photoShape !== "" && photoShape !== null) {
      photoShapeJson = JSON.parse(photoShape);
      for (i = 0, len = photoShapeJson.length; i < len; i++) {
        pushpinsImageJson[photoShapeJson[i].id] = photoShapeJson[i].image;
      }
    }

    if (len == 0) {
      return;
    }

    currentImageColorIndex = imageColors.indexOf(photoShapeJson[len - 1].image);
    currentImageColorIndex++;
    if (currentImageColorIndex >= imageColors.length) {
      currentImageColorIndex = 0;
    }
  }

  function getTextJson() {
    var textResource = $("input[name='PhotoMap.TextResource']").val();
    var textJson = JSON.parse(textResource);
    return textJson;
  }

  function getPushpinImageColor(id) {
    return pushpinsImageJson[id] ? pushpinsImageJson[id] : randomImageColor();
  }

  function randomImageColor() {
    var color = imageColors[currentImageColorIndex++];
    if (currentImageColorIndex >= imageColors.length) {
      currentImageColorIndex = 0;
    }

    return color;
  }

  function getPushpinImage(id) {
    return getPushpinImages()[getPushpinImageColor(id)];
  }

  function dataAndMenuInit() {
    var datas = JSON.parse($("input[name='Photo.datas']").val());
    var mapType = $("input[name='Photo.mapType']").val();
    var listString = "";
    var i, len;

    createPushpinsImageJson();

    if (datas) {
      for (i = 0, len = datas.length; i < len; i++) {
        switch (mapType.toLowerCase()) {
          case "asset":
            listString +=
              '<li dataid="' +
              datas[i].AssetId +
              '">' +
              '<span dataid="' +
              datas[i].AssetId +
              '" class="pushpin">' +
              '<img dataid="' +
              datas[i].AssetId +
              '" class="handle" src="' +
              getPushpinImage(datas[i].AssetId) +
              '" />' +
              '<input type="hidden" class="photoJson" value="" />' +
              "</span>" +
              '<span class="name">' +
              datas[i].Name +
              "</span>" +
              "</li>";
            jsonData["asset" + datas[i].AssetId] = datas[i];
            break;
          case "site":
            listString +=
              '<li dataid="' +
              datas[i].LocationId +
              '">' +
              '<span dataid="' +
              datas[i].LocationId +
              '" class="pushpin">' +
              '<img dataid="' +
              datas[i].LocationId +
              '" class="handle" src="' +
              getPushpinImage(datas[i].LocationId) +
              '" />' +
              '<input type="hidden" class="photoJson" value="" />' +
              "</span>" +
              '<span class="name">' +
              datas[i].LocalizedName +
              "</span>" +
              "</li>";
            jsonData["site" + datas[i].LocationId] = datas[i];
            break;
          case "location":
            listString +=
              '<li dataid="' +
              datas[i].AssetId +
              '">' +
              '<span dataid="' +
              datas[i].AssetId +
              '" class="pushpin">' +
              '<img dataid="' +
              datas[i].AssetId +
              '" class="handle" src="' +
              getPushpinImage(datas[i].AssetId) +
              '" />' +
              '<input type="hidden" class="photoJson" value="" />' +
              "</span>" +
              '<span class="name">' +
              datas[i].Name +
              "</span>" +
              "</li>";
            jsonData["location" + datas[i].AssetId] = datas[i];
            break;
        }
      }
    }
    $("#showPhoto_InfoBoxContainer .dataList").html(listString);
    $("#showPhoto_InfoBoxContainer .dataList .photoJson").each(function() {
      var dataId = $(this)
        .parents("li[dataid]")
        .attr("dataid");
      $(this).val(
        JSON.stringify({
          id: dataId,
          image: getPushpinImageColor(dataId),
          position: { x: 400, y: 280 }
        })
      );
    });
  }

  function draggabillyInit(draggableElem) {
    deleteFlag = false;
    var draggie = new Draggabilly(draggableElem, {
      containment: "#showPhoto",
      handle: ".handle"
    });

    if (!draggies.hasOwnProperty($(draggableElem).attr("dataid"))) {
      draggies[$(draggableElem).attr("dataid")] = draggie;
    }

    draggie.on("dragEnd", function() {
      var obj = this.$element;
      var $photoJson = obj.find(".photoJson");
      var json = JSON.parse($photoJson.val());
      json.position = { x: this.position.x, y: this.position.y };
      $photoJson.val(JSON.stringify(json));
      if (isEdit && deleteFlag) {
        draggie.destroy();
        obj.remove();
        deleteFlag = false;
      }
    });

    draggie.on("staticClick", function() {
      var objPushPin = this.$element;
      var mapType = $("input[name='Photo.mapType']").val();
      var hasEdit = $("input[name='Photo.hasEdit']").val();
      var selectId = $("input[name='Photo.id']").val();
      var id = JSON.parse(objPushPin.find(".photoJson").val()).id;
      var obj = jsonData[mapType.toLowerCase() + id];
      var contentStr = "";
      var textJson = getTextJson();
      var title = "";
      var nameStr = "";
      var noStr = "";
      var jsonArguments = "";
      switch (mapType.toLowerCase()) {
        case "site":
          nameStr = obj["LocalizedName"] == null ? "" : obj["LocalizedName"];
          noStr = obj["LocationNo"] == null ? "" : obj["LocationNo"];
          title = nameStr + " - " + noStr;

          contentStr = "<table id='photoMapDetailInfo'>";
          for (var element in obj) {
            if (obj.hasOwnProperty(element)) {
              if (obj[element] != id) {
                var value = obj[element] == null ? "" : obj[element];
                contentStr +=
                  "<tr><td style='width:100px;height:24px'>" +
                  $("#lblResource_" + element).val() +
                  ": </td><td>" +
                  value +
                  "</td></tr>";
              }
            }
          }

          contentStr +=
            "<tr><td style='width:100px;height:24px'><a id='WorkOrderHref_" +
            id +
            '\' href="javascript:" onclick="">Work Orders</a></td></tr>';
          jsonArguments =
            "ViewRedirect('Management','WorkOrder','','{\"siteId\":\"" +
            selectId +
            "\"}');$('#btnAlertPopOK').click();$('#btnConfirmPopOK').click();";
          break;

        case "asset":
        case "location":
          nameStr = obj["Name"] == null ? "" : obj["Name"];
          noStr = obj["AssetNo"] == null ? "" : obj["AssetNo"];
          title = nameStr + " - " + noStr;

          contentStr = "<table id='photoMapDetailInfo' style='width:400px;'>";
          var trIndex = 0;
          var nameVal = obj["Name"] == null ? "" : obj["Name"];
          var statusVal = obj["Status"] == null ? "" : obj["Status"];
          var assetNoVal = obj["AssetNo"] == null ? "" : obj["AssetNo"];
          var serialNoVal = obj["SerialNo"] == null ? "" : obj["SerialNo"];
          var makeVal = obj["Make"] == null ? "" : obj["Make"];
          var modelVal = obj["Model"] == null ? "" : obj["Model"];
          var barcodeVal = obj["BarCode"] == null ? "" : obj["BarCode"];

          contentStr +=
            "<tr>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_Name").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            nameVal +
            "</td>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_Status").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            statusVal +
            "</td></tr>";

          contentStr +=
            "<tr>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_AssetNo").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            assetNoVal +
            "</td>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_SerialNo").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            serialNoVal +
            "</td></tr>";

          contentStr +=
            "<tr>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_Make").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            makeVal +
            "</td>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_Model").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            modelVal +
            "</td></tr>";

          contentStr +=
            "<tr>" +
            "<td style='width:50px;height:24px'>" +
            $("#lblResource_BarCode").val() +
            ": </td>" +
            "<td style='width:150px;'>" +
            barcodeVal +
            "</td></tr>";

          contentStr +=
            "<tr><td style='width:100px;height:24px'><a id='WorkOrderHref_" +
            id +
            '\' href="javascript:" onclick="">Work Orders</a></td></tr>';

          jsonArguments =
            "ViewRedirect('Management','WorkOrder','','{\"locationId\":\"" +
            selectId +
            "\"}');$('#btnAlertPopOK').click();$('#btnConfirmPopOK').click();";
          if (mapType.toLowerCase() == "asset") {
            jsonArguments =
              "ViewRedirect('Management','WorkOrder','','{\"assetId\":\"" +
              selectId +
              "\"}');$('#btnAlertPopOK').click();$('#btnConfirmPopOK').click();";
          }

          break;
      }
      contentStr += "</table>";

      if (isEdit) {
        ShowConfirmPop(
          contentStr,
          null,
          function() {
            draggie.destroy();
            objPushPin.remove();
            deleteFlag = false;
          },
          $("#BtnOK").val(),
          $("#BtnDelete").val(),
          title
        );
      } else {
        ShowAlertPopup(contentStr, null, title);
      }

      var workOrderHref = $("#WorkOrderHref_" + id);
      if (workOrderHref) {
        workOrderHref.attr("onclick", jsonArguments);
      }
    });
  }

  function pushpinAddEventBind() {
    $("#cpbPhotoEditor .dataList").on("dblclick", "li", function() {
      var hasPushpin =
        $("#showPhoto .pushpin img[dataid=" + $(this).attr("dataid") + "]")
          .length > 0;
      if (!hasPushpin) {
        var $pushpin = $(this)
          .find(".pushpin")
          .clone();
        $pushpin.css({ left: "400px", top: "280px" });
        $("#showPhoto").append($pushpin);
        draggabillyInit($("#showPhoto .pushpin:last")[0]);
      }
    });
  }

  function pushpinEditEventBind() {
    $("#photoMenuContainer").on("click", ".btnEdit", function() {
      enableBtn($("#photoMenuContainer>.btnSave"));
      disableBtn($(this));
      isEdit = true;

      pushpinAddEventBind();
      pushpinDeleteEventBind();
      pushpinColorChangeEventBind();
      SetMediumPickerEnable(true);
      SetMediumDeleteEnable(true);
      enablePushpinDragEvent();
    });
  }

  function pushpinSaveEventBind() {
    $("#photoMenuContainer").on("click", ".btnSave", function() {
      var $pushpins = $("#showPhoto .photoJson");
      var photoShape = [],
        model = {};
      var $this = $(this);

      $pushpins.each(function() {
        var json = JSON.parse($(this).val());
        photoShape.push(json);
      });

      model.Id = $("input[name='Photo.id']").val();
      model.Type = $("input[name='Photo.mapType']").val();
      model.PhotoMapId = $("input[name='PhotoMap.PhotoId']").val();
      if (!model.PhotoMapId) {
        model.PhotoMapId = "0";
      }

      model.PhotoShape = JSON.stringify(photoShape);

      $.ajax({
        url: GetRootVirtaulPath("Common/PhotoMapSave"),
        data: {
          photoMapItemModel: JSON.stringify(model)
        },
        type: "post",
        beforeSend: function() {
          disableBtn($this);
        },
        success: function(result) {
          if (!result.isSuccess) {
            ShowAlertPopup(result.message);
          }
        },
        complete: function() {
          enableBtn($("#photoMenuContainer>.btnEdit"));
          disableBtn($this);
          isEdit = false;
          //enableBtn($this);
          removePushpinAddEvent();
          removePushpinDeleteEvent();
          removePushpinColorChangeEvent();
          SetMediumPickerEnable(false);
          SetMediumDeleteEnable(false);
          disablePushpinDragEvent();
        }
      });
    });
  }

  function SetMediumPickerEnable(enableFlag) {
    if (enableFlag === true) {
      $("input[name='imgMediumPicker_PhotoMap']").removeAttr("disabled");
      $("input[name='imgMediumPicker_PhotoMap']").attr(
        "src",
        $("#PhotoMap_MediumPickerIcon").val()
      );
    } else {
      $("input[name='imgMediumPicker_PhotoMap']").attr("disabled", "disabled");
      $("input[name='imgMediumPicker_PhotoMap']").attr(
        "src",
        $("#PhotoMap_MediumPickerIconOff").val()
      );
    }
  }

  function SetMediumDeleteEnable(enableFlag) {
    if (enableFlag === true) {
      $("input[name='deleteImage_PhotoMap.PhotoId']").removeAttr("disabled");
      $("input[name='deleteImage_PhotoMap.PhotoId']").attr(
        "src",
        $("#PhotoMap_MediumDeleteIcon").val()
      );
    } else {
      $("input[name='deleteImage_PhotoMap.PhotoId']").attr(
        "disabled",
        "disabled"
      );
      $("input[name='deleteImage_PhotoMap.PhotoId']").attr(
        "src",
        $("#PhotoMap_MediumDeleteIconOff").val()
      );
    }
  }

  function pushpinShow() {
    var photoShapeJson, i, len, pushpin;
    var photoShape = $("#photoShape").val();
    if (photoShape !== "" && photoShape !== null) {
      photoShapeJson = JSON.parse(photoShape);
      for (i = 0, len = photoShapeJson.length; i < len; i++) {
        pushpin =
          '<span class="pushpin" dataid="' +
          photoShapeJson[i].id +
          '" style="top:' +
          photoShapeJson[i].position.y +
          "px;left:" +
          photoShapeJson[i].position.x +
          'px">' +
          '<img dataid="' +
          photoShapeJson[i].id +
          '" class="handle" src="' +
          getPushpinImages()[photoShapeJson[i].image] +
          '" />' +
          '<input type="hidden" class="photoJson" value="" />' +
          "</span>";
        $("#showPhoto").append(pushpin);
        $("#showPhoto .photoJson:last").val(JSON.stringify(photoShapeJson[i]));
        draggabillyInit($("#showPhoto .pushpin:last")[0]);
      }
    }
  }

  function pushpinDeleteEventBind() {
    $("#showPhoto").on("mouseenter", ".pushpin, #mapPhoto", function() {
      deleteFlag = false;
    });
    $("#showPhoto").on("mouseleave", ".pushpin, #mapPhoto", function() {
      deleteFlag = true;
    });
  }

  function pushpinColorChangeEventBind() {
    $("#showPhoto_PushpinsContainer .dataList").on(
      "click",
      ".handle",
      function() {
        var $this = $(this);
        var str = "";
        var pushpinImage = getPushpinImages();
        for (var img in pushpinImage) {
          if (pushpinImage.hasOwnProperty(img)) {
            str += "<img color=" + img + ' src="' + pushpinImage[img] + '" />';
          }
        }

        ShowConfirmPop(
          '<div class="pushpinImages">' + str + "</div>",
          function() {
            var imgColor = $(".pushpinImages .selected").attr("color");
            var $pushpinImages = $(
              "#cpbPhotoEditor .pushpin img[dataid=" +
                $this.attr("dataid") +
                "]"
            );
            $pushpinImages.attr("src", pushpinImage[imgColor]);
            $pushpinImages.each(function() {
              var $photoJson = $(this).siblings(".photoJson");
              var json = JSON.parse($photoJson.val());
              json.image = imgColor;
              $photoJson.val(JSON.stringify(json));
            });
          },
          null,
          $("#BtnOK").val(),
          $("#BtnCancel").val(),
          getTextJson().selectPushpinImage
        );
      }
    );
    $("body").on("click", ".pushpinImages img", function() {
      $(this)
        .addClass("selected")
        .siblings()
        .removeClass("selected");
    });
  }

  function enablePushpinDragEvent() {
    var pushpins = $("#showPhoto .pushpin");
    for (var i = 0; i < pushpins.length; i++) {
      if (draggies.hasOwnProperty($(pushpins[i]).attr("dataid"))) {
        draggies[$(pushpins[i]).attr("dataid")].enable();
      }
    }
  }

  function removePushpinAddEvent() {
    $("#cpbPhotoEditor .dataList").off("dblclick", "li");
  }

  function removePushpinDeleteEvent() {
    $("#showPhoto").off("mouseenter", ".pushpin, #mapPhoto");
    $("#showPhoto").off("mouseleave", ".pushpin, #mapPhoto");
  }

  function removePushpinColorChangeEvent() {
    $("#showPhoto_PushpinsContainer .dataList").off("click", ".handle");
  }

  function disablePushpinDragEvent() {
    var pushpins = $("#showPhoto .pushpin");
    for (var i = 0; i < pushpins.length; i++) {
      if (draggies.hasOwnProperty($(pushpins[i]).attr("dataid"))) {
        draggies[$(pushpins[i]).attr("dataid")].disable();
      }
    }
  }

  function removeAllPushpin() {
    var pushpins = $("#showPhoto .pushpin");
    for (var i = 0; i < pushpins.length; i++) {
      if (draggies.hasOwnProperty($(pushpins[i]).attr("dataid"))) {
        var draggie = draggies[$(pushpins[i]).attr("dataid")];
        draggie.destroy();
        $(pushpins[i]).remove();
      }
    }
  }

  my.init = function() {
    currentImageColorIndex = 0;
    hasEdit =
      $("input[name='Photo.hasEdit']")
        .val()
        .toLowerCase() == "true";
    dataAndMenuInit();
    pushpinEditEventBind();
    pushpinSaveEventBind();
    pushpinShow();
    SetMediumPickerEnable(false);
    SetMediumDeleteEnable(false);
    disablePushpinDragEvent();
    if (hasEdit) {
      disableBtn($(".btnSave"));
      enableBtn($(".btnEdit"));
    } else {
      disableBtn($(".btnSave"));
      disableBtn($(".btnEdit"));
    }
  };

  my.onBeginCallback = function(s, e) {
    e.customArgs["id"] = $("input[name='Photo.id']").val();
    e.customArgs["mapType"] = $("input[name='Photo.mapType']").val();
  };

  my.RemoveAllPushpin = function() {
    removeAllPushpin();
  };

  return my;
})();

/*wrapper-dropdown start*/
function DropDown(el) {
  $this = el;
  $this.off("click").on("click", function(event) {
    $(".wrapper-dropdown").each(function() {
      if ($(this).is($(event.target))) {
        $(this).toggleClass("active");
      } else {
        $(this).removeClass("active");
      }
    });
    event.stopPropagation();
  });
}
/*wrapper-dropdown end*/
