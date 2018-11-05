if (typeof clientId != "undefined" && clientId.length > 0) {
  clientKey = "-" + clientId;
}

$(document).ready(function() {
  if ($("#hidIsNewLayout").length) {
    var state = History.getState(); // Note: We are using History.getState() instead of event.state
    var path = ParseUrl(state.url);
    SetNavVariablesToCookie(
      path.action,
      path.controller,
      "",
      ConvertToStringifiedJSON(path.queryParams)
    );
  }
});

function GetRootVirtaulPath(relativePath) {
  var objWebSiteRootVirtualPath = $("#webSiteRootVirtualPath");

  if (objWebSiteRootVirtualPath.length != 0) {
    return objWebSiteRootVirtualPath.val() + relativePath;
  }

  return relativePath;
}

(function(window, undefined) {
  // Prepare
  var History = window.History; // Note: We are using a capital H instead of a lower h

  // Bind to StateChange Event
  History.Adapter.bind(window, "statechange", function() {
    // Note: We are using statechange instead of popstate
    var state = History.getState(); // Note: We are using History.getState() instead of event.state
    var path = ParseUrl(state.url);

    if (!path.action && !path.controller) {
      window.history.back();
    }

    if (History.isLastSavedState(state)) {
      _action =
        path.action == "" || typeof path.action == "undefined"
          ? "Index"
          : path.action;
      _controller =
        path.controller == "" || typeof path.controller == "undefined"
          ? "Main"
          : path.controller;
      _directToView =
        state.data.fromView == "" || typeof state.data.fromView == "undefined"
          ? false
          : state.data.fromView;
      _arguments = ConvertToStringifiedJSON(path.queryParams);

      SetNavVariablesToCookie(_action, _controller, _directToView, _arguments);

      var currentlyInView = $("#hidIsNewLayout").length > 0;

      if (!currentlyInView && !_directToView) {
        var isActionReturned = $.cookie("Zion_IsActionReturned" + clientKey);
        if (isActionReturned != "True") {
          if (_isLoadBodyCallbackPanel) {
            BodyPanelCallback();
          } else {
            _isLoadBodyCallbackPanel = true;
            window.onload = function() {
              BodyPanelCallback();
            };
          }
        }

        $.cookie("Zion_IsActionReturned" + clientKey, "False");
      } else {
        var baseUrlForRedirect = appRootUrl;
        if (typeof standardUrl !== "undefined") {
          baseUrlForRedirect = standardUrl;
        }

        var queryString = path.queryParams;
        if (queryString != "") {
          queryString = "?" + queryString;
        }

        route = baseUrlForRedirect + _controller + "/" + _action + queryString;
        window.location.href = route;
      }
    }
  });

  setTimeout(ClearPickerPageStates, 0);
})(window);

function ClearPickerPageStates() {
  if (_clearPickerPageStates) {
    _clearPickerPageStates = false;
    $.post(GetRootVirtaulPath("Main/ClearPickerPageStates"));
  } else {
    _clearPickerPageStates = true;
  }
}

function ConvertToStringifiedJSON(queryString, asJson) {
  var argument = {};

  if (queryString) {
    var queryJSON = queryString.split("&");

    $.each(queryJSON, function(i, keyValueStr) {
      var keyValuePair = keyValueStr.split("=");
      var key = keyValuePair[0];
      var value = keyValuePair[1];

      if (key && value) {
        argument[key] = value;
      }
    });

    if (!asJson) {
      argument = JSON.stringify(argument);
    }
  } else {
    argument = "{}";
  }

  return argument;
}

function SetNavVariables(action, controller, directToView, args) {
  _action = action;
  _controller = controller;
  _directToView = directToView;
  _arguments = args;

  SetNavVariablesToCookie(_action, _controller, _directToView, _arguments);
  SetHistory(_action, _controller, _directToView, _arguments);
}

function SetNavVariablesToCookie(action, controller, directToView, args) {
  var defaultPath = "/";

  $.cookie("Zion_Action" + clientKey, action, { path: defaultPath });
  $.cookie("Zion_Controller" + clientKey, controller, { path: defaultPath });
  $.cookie("Zion_DirectToView" + clientKey, directToView, {
    path: defaultPath
  });
  $.cookie("Zion_QueryString" + clientKey, ConvertToQueryString(args), {
    path: defaultPath
  });
}

function SetHistory(action, controller, directToView, args) {
  var queryString = ConvertToQueryString(args);

  SetHistoryWithQueryString(action, controller, directToView, queryString);
}

function SetHistoryWithQueryString(
  action,
  controller,
  directToView,
  queryString
) {
  var route;

  if (queryString != "") {
    queryString = "?" + queryString;
  }

  if (controller.length == 0 || action.length == 0) {
    controller = "Home";
    action = "Index";
  }

  route = CreateRoute(controller, action, queryString);

  var fromView = directToView && directToView.toLowerCase() == "true";

  if (this.app && this.app.app && this.app.app.__vue__) {
    var vue = this.app.app.__vue__;
    vue.$router.push(route);
  }

  Navigate(route, fromView);
}

function CreateRoute(controller, action, queryString) {
  var baseUrlForRedirect = appRootUrl;
  if (typeof standardUrl !== "undefined") {
    baseUrlForRedirect = standardUrl;
  }

  if (!queryString) {
    queryString = "";
  }

  return baseUrlForRedirect + controller + "/" + action + queryString;
}

function Navigate(route, fromView) {
  var _route = route;

  var isMac = window.navigator && window.navigator.platform.match(/mac/gi);

  if (isMac) {
    window.History.replaceState(
      { fromView: fromView },
      window.document.title,
      _route
    );
  } else {
    window.History.replaceState(
      { fromView: fromView },
      window.document.title,
      _route
    );
  }
}

// Add cookie with current url value
function SetBackUrl() {
  var cookieKey_SummaryPage = "SummaryPage" + clientKey;
  var urls = $.cookie(cookieKey_SummaryPage);
  var currentUrl = window.History.getState().url;
  if (urls) {
    var urlStack = urls.split(";");
    urlStack.push(currentUrl);
    $.cookie(cookieKey_SummaryPage, urlStack.join(";"));
  } else {
    $.cookie(cookieKey_SummaryPage, currentUrl);
  }
}

function ConvertToQueryString(args) {
  var queryString = "";
  if (args) {
    var _arguments = $.parseJSON(args);
    $.each(_arguments, function(key, value) {
      queryString += key + "=" + value + "&";
    });

    queryString = queryString.substr(0, queryString.length - 1);
  }

  return queryString;
}

function InitHttpGetRequest(action, controller, directToView, args) {
  SetNavVariables(action, controller, directToView, args);
}

function RedirectAction() {
  var objRedirectAction = $("#RedirectToAction");

  if (objRedirectAction.length > 0 && objRedirectAction.val() != "") {
    var _arguments = $.parseJSON(objRedirectAction.val());
    var redirectToView = "";
    RedirectToAction(
      _arguments.action,
      _arguments.controller,
      redirectToView,
      _arguments.args
    );
  }
}

function IsToView(controller) {
  var viewControllers = JSON.parse($("#hidViewControllers").val());
  return viewControllers.indexOf(controller) > -1;
}

function ToolItemRedirectAction(args) {
  var action = args[0];
  var controller = args[1];
  var directToView = args.length === 3 ? IsToView(controller) : args[2];
  var argments = args.length === 3 ? args[2] : args[3];

  // if you click the cancel button, will cancel the current callback request.
  bodyCallBack.abort();

  ViewRedirect(action, controller, directToView.toString(), argments);
}

function ToolbarItemSubmit(args) {
  if (!GridSort.validate()) {
    return;
  }
  var action = args[0];
  var controller = args[1];
  var containerId = args[2];
  var directToView = args[3];

  var isValid = ASPxClientEdit.ValidateEditorsInContainerById(
    containerId,
    "",
    true
  );
  var htmlValidate = true;

  if (
    controller.toLowerCase() == "workorder" &&
    $.inArray(action.toLowerCase(), _needToSavedCheckActions) > -1
  ) {
    htmlValidate = HtmlEditorValidate("hedWorkOrderWorkRequested");
    isValid = isValid && htmlValidate;
    var hidIsSignatureRequired = $("#hidIsSignatureRequired").val();
    var isTaskAutoComplete = $('input[name="hidIsTaskAutoComplete"]').val();
    var isTaskCompleteRequired = $(
      'input[name="hidIsTaskCompleteRequired"]'
    ).val();
    var isUserRequired = $('input[name="hidIsUserRequired"]').val();
    var hidHasWOTimers = $("#hidHasWOTimers").val();

    if (isValid && isUserRequired.toLowerCase() == "true") {
      var gv = GetDevObjByName("UserEditGridView");

      if (gv != null) {
        if (gv.pageRowCount == 0) {
          ShowAlertPopup($('input[name="hidPrompt_UserRequired"]').val());
          return;
        }
      }
    }

    if (isValid && isTaskCompleteRequired.toLowerCase() == "true") {
      var gv = GetDevObjByName("WOTaskEditGridView");

      if (gv != null) {
        for (var i = 0; i < gv.pageRowCount; i++) {
          var rowIdx = gv.GetPageIndex() * gv.pageRowSize + i;
          var row = gv.GetRow(rowIdx);
          if (row != null) {
            if (
              !GetDevObjByName(
                "TaskViewModel.Tasks[" + rowIdx + "].IsSucceeded"
              ).GetChecked()
            ) {
              ShowAlertPopup(
                $('input[name="hidPrompt_CompleteAllTask"]').val()
              );
              return;
            }
          }
        }
      }

      var gvNew = GetDevObjByName("WOTaskEditNewGridView");
      if (
        gvNew != null &&
        $("#hidIsSucceedAll")
          .val()
          .toLowerCase() == "true"
      ) {
        ShowAlertPopup($('input[name="hidPrompt_CompleteAllTask"]').val());
        return;
      }
    }

    if (isValid && isTaskAutoComplete.toLowerCase() == "true") {
      var gv = GetDevObjByName("WOTaskEditGridView");

      if (gv != null) {
        for (var i = 0; i < gv.pageRowCount; i++) {
          var rowIdx = gv.GetPageIndex() * gv.pageRowSize + i;
          var row = gv.GetRow(rowIdx);
          if (row != null) {
            GetDevObjByName(
              "TaskViewModel.Tasks[" + rowIdx + "].IsSucceeded"
            ).SetChecked(true);
          }
        }
      }
    }

    var woTaskNewGridView = GetDevObjByName("WOTaskEditNewGridView");
    if (
      woTaskNewGridView != null &&
      $("#btnSaveAndCancel").css("display") != "none" &&
      WOTasks.IsChangedWOTaskIndexs()
    ) {
      WOTasks.saveAndNoPerformCallback();
    }

    if (isValid && hidIsSignatureRequired.toLowerCase() == "true") {
      ShowSignItPopup("popSignIt", function() {
        if (
          ASPxClientEdit.ValidateEditorsInContainerById(
            "signItContent",
            "",
            true
          )
        ) {
          GetDevObjByName("popSignIt").Hide();
          $('input[name="WorkOrder.LastSigned"]').val(
            GetDevObjByName("txtSignature").GetValue()
          );
          $('input[name="WorkOrder.LastSignedOn"]').val(
            $('input[name="DateTimeCurrentNow"]').val()
          );

          if (isValid && hidHasWOTimers.toLowerCase() == "true") {
            var pop = GetDevObjByName("popHandleWOTimers");
            var targetWOStatusCategory = $(
              "#hidTargetWOStatusCategoryType"
            ).val();
            var completedWOStatusCategory = $(
              'input[name="hidWOStatusCategoryTypeIsCompleted"]'
            ).val();
            if (
              pop != null &&
              targetWOStatusCategory == completedWOStatusCategory
            ) {
              _action = action;
              _controller = controller;
              pop.Show();
              return;
            } else {
              SetSubmitVariables(action, controller, containerId);
              BodyPanelCallback();
            }
          } else {
            SetSubmitVariables(action, controller, containerId);
            BodyPanelCallback();
          }
        }
      });
      return;
    }

    if (isValid && hidHasWOTimers.toLowerCase() == "true") {
      var pop = GetDevObjByName("popHandleWOTimers");
      var targetWOStatusCategory = $("#hidTargetWOStatusCategoryType").val();
      var completedWOStatusCategory = $(
        'input[name="hidWOStatusCategoryTypeIsCompleted"]'
      ).val();
      if (pop != null && targetWOStatusCategory == completedWOStatusCategory) {
        _action = action;
        _controller = controller;
        pop.Show();
        return;
      }
    }
  } else if (
    controller.toLowerCase() == "purchaseorder" &&
    $.inArray(action.toLowerCase(), _needToSavedCheckActions) > -1
  ) {
    var hidSignatureRequired = $("#hidIsSignatureRequired").val();

    if (isValid && hidSignatureRequired.toLowerCase() == "true") {
      ShowSignItPopup("popSignIt", function() {
        if (
          ASPxClientEdit.ValidateEditorsInContainerById(
            "signItContent",
            "",
            true
          )
        ) {
          GetDevObjByName("popSignIt").Hide();
          $('input[name="PurchaseOrder.LastSigned"]').val(
            GetDevObjByName("txtSignature").GetValue()
          );
          $('input[name="PurchaseOrder.LastSignedOn"]').val(
            $('input[name="DateTimeCurrentNow"]').val()
          );

          SetSubmitVariables(action, controller, containerId);
          BodyPanelCallback();
        }
      });
      return;
    }
  } else if (controller.toLowerCase() == "emailtemplate") {
    htmlValidate = HtmlEditorValidate("hedBodyTemplate");
    isValid = isValid && htmlValidate;
  } else if (controller.toLowerCase() == "solution") {
    htmlValidate = HtmlEditorValidate("hedSolutionDescription");
    isValid = isValid && htmlValidate;
  } else if (controller.toLowerCase() == "myrequest") {
    htmlValidate = HtmlEditorValidate("hedMyRequestAction");
    var htmlValidateComment = HtmlEditorValidate("hedMyRequestComment");
    var htmlValidateWORequested = HtmlEditorValidate(
      "hedMyRequestWorkRequested"
    );

    isValid =
      isValid && htmlValidate && htmlValidateComment && htmlValidateWORequested;
  } else if (controller.toLowerCase() == "systemsetting") {
    GetADSettings();
  } else if (
    controller.toLowerCase() == "site" &&
    $("#hidhasGeoLoctionModule").length > 0 &&
    $("#hidhasGeoLoctionModule")
      .val()
      .toLowerCase() == "true"
  ) {
    var message = $.parseJSON($("#hidUpdateGeoLoctionMessage").val());
    var siteGeoLocationAddress = new Array(
      GetDevObjByName("Site.Addr1").GetValue(),
      GetDevObjByName("Site.Addr2").GetValue(),
      GetDevObjByName("Site.City").GetValue(),
      GetDevObjByName("Site.StateProvince").GetValue(),
      GetDevObjByName("Site.CountryCode").GetValue(),
      GetDevObjByName("Site.PostalCode").GetValue()
    );
    if (
      siteGeoLocationAddress.join(",").toLowerCase() !=
      $("#hidSiteGeoLocationAddress")
        .val()
        .toLowerCase()
    ) {
      ShowConfirmPop(
        String.format(
          message.MessageContent,
          GetDevObjByName("Site.LocalizedName").GetValue()
        ),
        function() {
          $("#IsUpdateGeoLocation").val(true);
          SetSubmitVariables(action, controller, containerId);
          BodyPanelCallback();
        },
        function() {
          SetSubmitVariables(action, controller, containerId);
          BodyPanelCallback();
        },
        message.OkText,
        message.NoText
      );

      return;
    }
  } else if (
    controller.toLowerCase() == "location" &&
    $("#hidhasGeoLoctionModule").length > 0 &&
    $("#hidhasGeoLoctionModule")
      .val()
      .toLowerCase() == "true"
  ) {
    var message = $.parseJSON($("#hidUpdateGeoLoctionMessage").val());
    var siteGeoLocationAddress = new Array(
      GetDevObjByName("Location.Addr1").GetValue(),
      GetDevObjByName("Location.Addr2").GetValue(),
      GetDevObjByName("Location.City").GetValue(),
      GetDevObjByName("Location.StateProvince").GetValue(),
      GetDevObjByName("Location.CountryCode").GetValue(),
      GetDevObjByName("Location.PostalCode").GetValue()
    );
    if (
      siteGeoLocationAddress.join(",").toLowerCase() !=
      $("#hidLocationGeoLocationAddress")
        .val()
        .toLowerCase()
    ) {
      ShowConfirmPop(
        String.format(
          message.MessageContent,
          GetDevObjByName("Location.LocalizedName").GetValue()
        ),
        function() {
          $("#IsUpdateGeoLocation").val(true);
          SetSubmitVariables(action, controller, containerId);
          BodyPanelCallback();
        },
        function() {
          SetSubmitVariables(action, controller, containerId);
          BodyPanelCallback();
        },
        message.OkText,
        message.NoText
      );

      return;
    }
  } else if (controller.toLowerCase() == "customfield") {
    var customFieldOption = $('input[name="CustomField.FieldOption"]');
    if (customFieldOption.length > 0) {
      var chkAll = GetDevObjByName("chkAvailabletoAll");
      if (chkAll != null && chkAll.GetChecked()) {
        // if all checked, set option is empty.
        customFieldOption.val("");
      } else {
        var selector = "#tblAvailableTos" + " input[name]";
        var optionIds = [];
        $(selector).each(function() {
          var controlName = $(this).attr("name");
          var devControl = GetDevObjByName(controlName);

          if (IsASPxClientCheckBox(devControl)) {
            if (devControl.GetChecked()) {
              var optionAttr = devControl.mainElement.attributes["OptionId"];
              if (optionAttr != undefined) {
                optionIds.push(optionAttr.value);
              }
            }
          }
        });

        if (optionIds.length == 0) {
          // any selected.
          ShowAlertPopup($('input[name="hidSelectOneSiteMsg"]').val());
          return;
        }
        customFieldOption.val(optionIds.join(","));
      }
    }
  } else if (controller.toLowerCase() == "termcondition") {
    htmlValidate = HtmlEditorValidate("hedContent");
    isValid = isValid && htmlValidate;
  } else if (controller.toLowerCase() == "project") {
    var chkApprovalRequired = GetDevObjByName("ApprovalRequired");

    if (chkApprovalRequired != null && chkApprovalRequired.GetChecked()) {
      var grid = GetDevObjByName("ProjectApprovalProcessEditGridView");
      if (grid != null && grid.GetRow(0) == null) {
        isValid = false;
        var messages = $.parseJSON($("#hidSaveValiteMsg").val());
        ShowAlertPopup(messages.SelectApprover);
        return;
      }
    }
  } else if (controller.toLowerCase() == "user") {
    if (action.toLowerCase() == "siteuserpermissonssave") {
      var selectSites = GetDevObjByName("SelectSites");
      if (selectSites != null && $("#SelectSiteIds").val() == "") {
        var objSelectSiteIds = GetDevObjByName("listBoxSelectSiteIds");
        if (objSelectSiteIds != null) {
          var selectSiteIds = objSelectSiteIds.GetSelectedValues();
          if (selectSiteIds.length == 0) {
            $("#lblMessage").text($("#hidSelectSiteMsg").val());
            return;
          }
          $("#SelectSiteIds").val(selectSiteIds.join());
        }
      }
      $("#lblMessage").text("");
    } else if (action.toLowerCase() == "regionuserpermissonssave") {
      var selectRegions = GetDevObjByName("SelectRegions");
      if (selectRegions != null && $("#SelectRegionIds").val() == "") {
        var objSelectRegionIds = GetDevObjByName("listBoxSelectRegionIds");
        if (objSelectRegionIds != null) {
          var selectRegionIds = objSelectRegionIds.GetSelectedValues();
          if (selectRegionIds.length == 0) {
            $("#lblMessage").text($("#hidSelectRegionMsg").val());
            return;
          }
          $("#SelectRegionIds").val(selectRegionIds.join());
        }
      }
      $("#lblMessage").text("");
    }
  } else if (controller.toLowerCase() == "wostatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.LocationId == value2.LocationId &&
              value1.AssetId == value2.AssetId &&
              value1.CategoryId == value2.CategoryId &&
              value1.WOTypeId == value2.WOTypeId &&
              value1.WorkTypeId == value2.WorkTypeId &&
              value1.PriorityId == value2.PriorityId &&
              value1.ProblemId == value2.ProblemId &&
              value1.CauseId == value2.CauseId &&
              value1.CostCenterId == value2.CostCenterId &&
              value1.Origin == value2.Origin)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  } else if (controller.toLowerCase() == "projectstatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.PriorityId == value2.PriorityId &&
              value1.CostCenterId == value2.CostCenterId)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  } else if (controller.toLowerCase() == "assetstatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.LocationId == value2.LocationId &&
              value1.CategoryId == value2.CategoryId &&
              value1.SupplierId == value2.SupplierId &&
              value1.AssetConditionId == value2.AssetConditionId &&
              value1.CriticalityId == value2.CriticalityId &&
              value1.CostCenterId == value2.CostCenterId)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  } else if (controller.toLowerCase() == "locationstatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.LocationConditionId == value2.LocationConditionId &&
              value1.CriticalityId == value2.CriticalityId &&
              value1.CostCenterId == value2.CostCenterId)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  } else if (controller.toLowerCase() == "postatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.CostCenterId == value2.CostCenterId &&
              value1.SupplierId == value2.SupplierId)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  } else if (controller.toLowerCase() == "inspectionstatus") {
    var isDuplicate = false;
    var subscribers = $.parseJSON($("#SubscribersJsonString").val());
    if (subscribers.length > 1) {
      $.each(subscribers, function(i, value1) {
        $.each(subscribers, function(j, value2) {
          if (
            j > i &&
            (value1.SubscriberId == value2.SubscriberId &&
              value1.RegionId == value2.RegionId &&
              value1.SiteId == value2.SiteId &&
              value1.InspectionCategoryId == value2.InspectionCategoryId)
          ) {
            isDuplicate = true;
            return false;
          }
        });
        if (isDuplicate) {
          return false;
        }
      });
    }
    if (isDuplicate) {
      var message = $("#DuplicateSubscriberMessage").val();
      ShowAlertPopup(message);
      return;
    }
  }

  if (!isValid) {
    var messageLabel = $("#lblInputValidationMsg");

    if (messageLabel.length > 0) {
      messageLabel.show();
    }
  } else {
    if (directToView && directToView.toLowerCase() == "true") {
      SendPostRequest(controller, action, containerId);
    } else {
      SetSubmitVariables(action, controller, containerId);
      BodyPanelCallback();
    }
  }
}

function PageCallback(action, controller, containerId) {
  $.ajax({
    method: "POST",
    url: CreateRoute(controller, action),
    data: JSON.parse(RetrievePostData(containerId)),
    beforeSend: function() {
      bodyLoadingPanel.Show();
    },
    success: function(response) {
      $("#viewBody").html(response);
      bodyLoadingPanel.Hide();
      initializeControls();
    },
    error: function(response) {
      if (response.Data) {
        bodyLoadingPanel.Hide();
        $("#exceptionPopupPartial").load(response.Data);
      }
    }
  });
}

function BodyPanelCallback(action, controller, containerId) {
  var currentlyInView = $("#hidIsNewLayout").length > 0;
  if (typeof cbpBody != "undefined" && cbpBody.PerformCallback) {
    cbpBody.PerformCallback();
  } else if (currentlyInView) {
    PageCallback(action, controller, containerId);
  }
}

function SendPostRequest(
  controller,
  action,
  containerId,
  externalData,
  settings
) {
  if (!settings) {
    settings = {};
  }

  bodyLoadingPanel.Show();

  var data = RetrievePostData(containerId);

  if (externalData && typeof externalData === "object") {
    if (settings.UseExternalDataOnly) {
      data = JSON.stringify(externalData);
    } else {
      var compositeData = Object.assign(JSON.parse(data), externalData);
      data = JSON.stringify(compositeData);
    }
  }

  $.ajax({
    type: "POST",
    url: GetRootVirtaulPath("/" + controller + "/" + action),
    contentType: "application/json",
    data: data,
    success: function(response) {
      if (response.Success) {
        bodyLoadingPanel.Hide();
        Navigate(response.Data, "true");
      } else {
        if (response.Data) {
          bodyLoadingPanel.Hide();
          $("#exceptionPopupPartial").load(response.Data);
        }
      }
    },
    error: function(response) {
      bodyLoadingPanel.Hide();
      console.log(response);
      if (response) {
        $("#exceptionPopupPartial").load(
          CreateRoute(controller, "ExceptionPopupPartial"),
          { errorMessage: response.responseText }
        );
      }
    }
  });
}

function RetrievePostData(containerId) {
  var data = GetInputValuesAsJson(containerId, true);

  //Handle the HtmlEditor's html data.
  var htmlEditors = $("#hidHtmlEditors");

  if (htmlEditors.length > 0) {
    var values = $.parseJSON(htmlEditors.val());
    $.each(values, function(key, value) {
      if (GetDevObjByName(key)) {
        data[value] = HtmlEncode(GetDevObjByName(key).GetHtml());
      }
    });
  }

  return ProcessTabNewLine(JSON.stringify(data));
}

function ToolbarItemSubmitWithGridView(args) {
  if (!GridSort.validate()) {
    return;
  }
  var action = args[0];
  var controller = args[1];
  var containerId = args[2];
  var gridName = args[3];
  var directToView = args[5];

  var hasError = false;
  var isaction = $.inArray(action.toLowerCase(), _needToSavedCheckActions) > -1;
  if (controller == "Part" && isaction) {
    hasError = GetSupplierDataFromGridView(gridName);
  } else if (controller == "Asset" && isaction) {
    hasError = GetAssetContactDataFromGridView(gridName);
  } else if (controller == "Incident" && isaction) {
    hasError = IncidentUser.GetIncidentUserDataFromGridView(gridName);
  }

  if (controller == "Asset" && action == "MeterReadingBatchSave") {
    GetMeterReadingsFromGridView();
  }

  if (controller.toLowerCase() == "asset") {
    var selectCrews = GetDevObjByName("SelectCrews");
    if (selectCrews != null) {
      var objSelectCrewIds = GetDevObjByName("listBoxSelectAssetCrewIds");
      if (objSelectCrewIds != null) {
        $("#SelectCrewsIds").val(objSelectCrewIds.GetSelectedValues().join());
      }
    }
  }

  if (hasError) {
    return;
  }

  var isValid = ASPxClientEdit.ValidateEditorsInContainerById(
    containerId,
    "",
    true
  );
  if (!isValid) {
    var messageLabel = $("#lblInputValidationMsg");

    if (messageLabel.length > 0) {
      messageLabel.show();
    }
  } else {
    if (directToView && directToView.toLowerCase() == "true") {
      SendPostRequest(controller, action, containerId);
    } else {
      SetSubmitVariables(action, controller, containerId);
      BodyPanelCallback();
    }
  }
}

function RedirectToAction(action, controller, directToView, args) {
  SetNavVariables(action, controller, directToView, args);
  BodyPanelCallback();
}

function ViewRefresh() {
  ViewRedirect(_action, _controller, _directToView, _arguments);
}

function ViewRedirect(action, controller, directToView, args) {
  SetNavVariables(action, controller, directToView, args);
}

function ViewRedirectWithBackUrl(action, controller, directToView, args) {
  SetBackUrl();
  SetNavVariables(action, controller, directToView, args);
}

function ViewRedirectForDelete(
  action,
  controller,
  directToView,
  args,
  msg,
  associatedMsg
) {
  if (controller === "Asset" || controller === "Part") {
    msg =
      msg +
      "<br/><br/><input type='checkbox' checked='true' id='associatedData'>" +
      associatedMsg +
      "</input>";
    ShowConfirmPop(msg, function() {
      args =
        args.substring(0, args.length - 1) +
        ',"associatedData": "' +
        !$("#associatedData").prop("checked") +
        '" }';
      if (IsToView(controller)) {
        SingleItemDeleteForViewPage(action, controller, args);
      } else {
        SetNavVariables(action, controller, directToView, args);
      }
    });
  } else if (controller === "User") {
    var deletedUserAreaHtml = $('div[id="deletedUserArea"]').html();
    $('div[id="deletedUserArea"]').empty();
    msg =
      msg +
      "<div id='deletedUserAreaOnPopup'>" +
      deletedUserAreaHtml +
      "</div>";
    ShowConfirmPop(
      msg,
      function() {
        var objValues = $.parseJSON(args);
        var isReplacePMUser = GetDevObjByName("chk_PMAssignTo").GetChecked();
        var replacePMUserId = $("#PMAssignTo_UserId").val();
        var isReplaceInspectionUser = GetDevObjByName(
          "chk_InspectionAssignTo"
        ).GetChecked();
        var replaceInspectionUserId = $("#InspectionAssignTo_UserId").val();
        var isReplaceWOUser = GetDevObjByName("chk_WOAssignTo").GetChecked();
        var replaceWOUserId = $("#WOAssignTo_UserId").val();
        if (
          (isReplacePMUser && replacePMUserId == objValues.id) ||
          (isReplaceInspectionUser &&
            replaceInspectionUserId == objValues.id) ||
          (isReplaceWOUser && replaceWOUserId == objValues.id)
        ) {
          ShowAlertPopup(
            $("input[name='hidDeleteUserContainNewAssignTo']").val()
          );
          $('div[id="deletedUserAreaOnPopup"]').empty();
          $('div[id="deletedUserArea"]').html(deletedUserAreaHtml);
          return;
        }

        objValues["IsReplacePMUser"] = isReplacePMUser;
        objValues["ReplacePMUserId"] = replacePMUserId;
        objValues["IsReplaceInspectionUser"] = isReplaceInspectionUser;
        objValues["ReplaceInspectionUserId"] = replaceInspectionUserId;
        objValues["IsReplaceWOUser"] = isReplaceWOUser;
        objValues["ReplaceWOUserId"] = replaceWOUserId;

        if (IsToView(controller)) {
          SingleItemDeleteForViewPage(action, controller, args);
        } else {
          SetNavVariables(
            action,
            controller,
            directToView,
            $.toJSON(objValues)
          );
        }
      },
      function() {
        $('div[id="deletedUserArea"]').html(deletedUserAreaHtml);
      }
    );
  } else {
    ShowConfirmPop(
      msg,
      function() {
        if (IsToView(controller)) {
          SingleItemDeleteForViewPage(action, controller, args);
        } else {
          SetNavVariables(action, controller, directToView, args);
        }
      },
      null,
      $("#hidOKText").val()
    );
  }
}

function SingleItemDeleteForViewPage(action, controller, args) {
  $.ajax({
    type: "POST",
    url: GetRootVirtaulPath("/" + controller + "/" + action),
    contentType: "application/json",
    data: args,
    success: function(response) {
      if (response.Success) {
        Navigate(response.Data, "true");
      } else {
        if (response.Data) {
          $("#exceptionPopupPartial").load(response.Data);
        }
      }
    }
  });
}

function ClearUrlHistory() {
  $.removeCookie("SummaryPage");
}

/* ----- Menu logic Begin ----- */

function mnuMenu_ItemClick(s, e, clearPageStatesUrl) {
  if (e.item.name != "") {
    e.item.selected = true;

    $.cookie("Zion_MenuItemName" + clientKey, e.item.name);

    if ($(obj).attr("name") != "Index_Home") {
      ClearPageStates(clearPageStatesUrl);
    }

    var arr = e.item.name.split("_");
    var action = arr[0];
    var controller = arr[1];

    SetNavVariables(action, controller, "");
  }
}

function mnuMenu_ItemClick(obj, clearPageStatesUrl, isView) {
  ClearUrlHistory();
  mainMenu_ItemClick(obj, clearPageStatesUrl, isView);
}

function quickLinksOnClick(obj, clearPageStatesUrl) {
  SetBackUrl();
  mainMenu_ItemClick(obj, GetRootVirtaulPath(clearPageStatesUrl));
}

function mainMenu_ItemClick(obj, clearPageStatesUrl, isView) {
  if (typeof GridSort !== "undefined") {
    GridSort.reset();
  }

  if (obj != null && $(obj).attr("name") != "") {
    $.cookie("Zion_MenuItemName" + clientKey, $(obj).attr("name"));

    if ($(obj).attr("name") != "Index_Home") {
      ClearPageStates(clearPageStatesUrl);
    }

    var action = $(obj).attr("action");
    var controller = $(obj).attr("controller");

    SetNavVariables(action, controller, isView, $(obj).attr("args"));
  }
}

function mnuChangePassword_OnClick(s, e) {
  $("#hidChangeWordPasswordPopupPasswordResetRequired").val("False");
  popChangePassword.Show();
  popChangePassword.PerformCallback();
}

/* ----- Menu logic End ----- */

/* ----- Toolbar logic begin ----- */

function Toolbar_OnItemClick(s, e, name) {
  var jsonString = $("#toolbar_itemFunctions_" + name).val();
  var itemFuncs = $.parseJSON(jsonString);

  $.each(itemFuncs, function(key, value) {
    if (e.item.name == key) {
      window[value.func](value.args);
    }
  });
}

function ToolbarItem_New(args) {
  var action = args[0];
  var controller = args[1];
  var arguments = args[2];
  var validate = args[3];
  var directToView = args[4];
  var isEnable = false;

  if (controller === "CustomField" && action === "Add") {
    var hidCustomFieldGroupType = $("#hidCustomFieldGroupType");
    if (hidCustomFieldGroupType.length > 0) {
      arguments = '{"fieldGroup":"' + hidCustomFieldGroupType.val() + '"}';
    }
  }

  if (controller === "Tag" && action === "Add") {
    var hidCustomFieldGroupType = $("#hidCustomFieldGroupType");
    if (hidCustomFieldGroupType.length > 0) {
      arguments = '{"tagGroup":"' + hidCustomFieldGroupType.val() + '"}';
    }
  }

  if (validate != null && validate != "") {
    if (validate.indexOf(".") > -1) {
      isEnable = window[validate.split(".")[0]][validate.split(".")[1]]();
    } else {
      isEnable = window[validate]();
    }
    if (isEnable) {
      ViewRedirect(action, controller, directToView, arguments);
    }
  } else {
    ViewRedirect(action, controller, directToView, arguments);
  }
}

function ToolbarItem_Common(args) {
  var action = args[0];
  var controller = args[1];
  var arguments = args[2];
  var directToView = args[3];

  ViewRedirect(action, controller, directToView, arguments);
}

// OnClick on New btn
function CreateNewItem(args) {
  SetBackUrl();
  ToolbarItem_TreeViewNew(args);
}

function ToolbarItem_TreeViewNew(args) {
  var action = args[0];
  var controller = args[1];
  var directToView = args[3];

  var nodeId = GetTreeViewSelectedNodeValue();
  var siteId =
    GetSitePickerSelectedValue("treeViewSitePicker") == ""
      ? '""'
      : GetSitePickerSelectedValue("treeViewSitePicker");

  if (controller == "WorkOrder") {
    ViewRedirect(action, controller, directToView, args[2]);
    return true;
  }
  if (controller == "Asset" || controller == "Part") {
    var objArgs = {
      filterType: GetTreeViewFilterType(),
      siteId: siteId
    };

    if ($("#hidParentAssetId").length > 0) {
      objArgs["parentAssetId"] = $("#hidParentAssetId").val();
    }

    if (nodeId == "" || nodeId == "0") {
      ViewRedirect(action, controller, directToView, $.toJSON(objArgs));
    } else {
      objArgs["filterId"] = nodeId;
      ViewRedirect(action, controller, directToView, $.toJSON(objArgs));
    }

    return true;
  }

  if (controller == "MeterTitle") {
    if (siteId == 0) {
      siteId = '""';
    }

    if (nodeId == "" || nodeId == "0") {
      ViewRedirect(
        action,
        controller,
        directToView,
        '{"categoryId":""' + ', "siteId":' + siteId + "}"
      );
    } else {
      ViewRedirect(
        action,
        controller,
        directToView,
        '{"categoryId":' + nodeId + ', "siteId":' + siteId + "}"
      );
    }

    return true;
  }

  if (nodeId == "" || nodeId == "0") {
    ViewRedirect(action, controller, directToView, '{"siteId":' + siteId + "}");
  } else {
    ViewRedirect(
      action,
      controller,
      directToView,
      '{"parentId":' + nodeId + ', "siteId":' + siteId + "}"
    );
  }
}

function ToolbarItem_InlineNew(args) {
  var gridViewName = args[0];

  ASPx.GVScheduleCommand(gridViewName, ["AddNew"], 0);
}

function ToolbarItem_InlineEdit(
  gridName,
  itemIndex,
  tabName,
  tabHeight,
  pageCtrlName
) {
  ASPx.GVScheduleCommand(gridName, ["StartEdit", itemIndex], 1);
}

/* ----- Toolbar logic end ----- */

function ClearPageStates(clearPageStatesUrl) {
  $.post(clearPageStatesUrl);
  _clearPickerPageStates = false;
}
