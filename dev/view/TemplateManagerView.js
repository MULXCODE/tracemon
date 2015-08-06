/**
 * Created by mcandela on 05/11/13.
 */

define([
    "env.utils",
    "env.config",
    "env.languages.en",
    "lib.jquery-amd"
], function(utils, config, lang, $){

    /**
     * TemplateManagerView is the component in charge of creating and manipulating the HTML dom elements.
     *
     * @class TemplateManagerView
     * @constructor
     * @module view
     */

    var TemplateManagerView = function(env){
        var widgetUrl, slidingMenuOpened, insideSubMenu, $this, loadingImageCounter, loadingImageTimer;

        widgetUrl = env.widgetUrl;
        $this = this;
        loadingImageCounter = 0;

        this.loadingImage = '<img src="' + widgetUrl + 'view/img/loading2.gif" class="loading-image"/> ';

        this.overlayMessage = '<div class="error-message"></div>';

        this.infoHeader = {
            container: $('<div class="info-header"></div>'),
            left: $('<div class="left-info"></div>'),
            right: $('<div class="right-info"></div>')
        };

        this.infoHeader.container
            .append(this.infoHeader.left)
            .append(this.infoHeader.right);

        this.streamingLed = {
            label: $('<div class="streaming-label" title="' + lang.streamingInfo + '"></div>'),
            $: $('<div class="led-green streaming-led" title="' + lang.streamingInfo + '"></div>'),
            blink: function(){
                this.$.css({"animation": "none"});
                this.$.width(this.$.width());
                this.$.css({"animation": "blinkGreen 1s"});
            },
            on: function(){
                if (!this.appended) {
                    env.parentDom.find(".led-box").append(this.$).after(this.label);
                    this.appended = true;
                }
                this.label.text("Streaming on");
                this.$.removeClass("led-red").addClass("led-green")
            },
            off: function(){
                if (!this.appended) {
                    env.parentDom.find(".led-box").append(this.$).after(this.label);
                    this.appended = true;
                }
                this.label.text("Streaming off");
                this.$.removeClass("led-green").addClass("led-red")
            }
        };

        this.controlPanel =
            '<div class="button-group">' +
            '<div class="control-panel left-bar">' +

            '<div class="button open-add-measurement-panel" title="' + lang.addMeasurement + '">' +
            '<img src="' + widgetUrl + 'view/img/add_measurement.png"/>' +
            '</div>' +

            '<div class="button open-add-line-panel" title="' + lang.addLineIcon + '">' +
            '<img src="' + widgetUrl + 'view/img/add-line.png"/>' +
            '</div>' +

            '<div class="button open-add-group-panel" title="' + lang.addGroupIcon + '">' +
            '<img src="' + widgetUrl + 'view/img/add-group.png"/>' +
            '</div>' +

            '</div>' +

            '<div class="control-panel right-bar">' +

            '<div class="button forward" title="' + lang.forwardTitle + '">' +
            '<img src="' + widgetUrl + 'view/img/dnsmon_forward_icon.png"/>' +
            '</div>' +

            '<div class="button right" title="' + lang.shiftRightTitle + '">' +
            '<img src="' + widgetUrl + 'view/img/right_icon.png"/>' +
            '</div>' +

            '<div class="button zoom-in" title="' + lang.zoomInTitle + '">' +
            '<img src="' + widgetUrl + 'view/img/zoomin_icon.png"/>' +
            '</div>' +

            '<div class="button zoom-out" title="' + lang.zoomOutTitle + '">' +
            '<img src="' + widgetUrl + 'view/img/zoomout_icon.png"/>' +
            '</div>' +

            '<div class="button left" title="' + lang.shiftLeftTitle+ '">' +
            '<img src="' + widgetUrl + 'view/img/left_icon.png"/>' +
            '</div>' +

            '<div class="button chart-mode" title="' + lang.chartModeTitle.relative + '">' +
            '<img src="' + widgetUrl + 'view/img/chart_mode.png"/>' +
            '</div>' +

                //'<div class="button timepicker">' +
                //'<img src="' + widgetUrl + 'view/img/calendar_icon.png"/>' +
                //'</div>' +

                //'<div class="button filters">' +
                //'<img src="' + widgetUrl + 'view/img/filter_icon.png"/>' +
                //'</div>' +

                //'<div class="button full-screen">' +
                //'<img src="' + widgetUrl + 'view/img/dnsmon_fullscreen_icon.png"/>' +
                //'</div>' +
            '</div>' +
            '<div class="led-box"></div>' +
            '</div>';



        this.slidingMenu = $('<div class="sliding-panel">' +
            '</div>');

        this.getLastData = $(function(){
            var out = "";
            for (var key in config.predefinedTimeWindows){
                out += "<div>" + key + "</div>"
            }
            return out;
        }());

        this.timepickersPopup =
            '<div style="float: left;">' + lang.startDateLabel + ' <br/><input type="text" class="timepicker-start date-field" /></div>' +
            '<div style="position: absolute; top: 15px; left: 145px;"><img style="" src="' + widgetUrl + 'view/img/double_arrow.gif" /></div>' +
            '<div style="float: right;">' + lang.endDateLabel + ' <br/><input type="text" class="timepicker-stop date-field" /></div>';



        this.timeOverview = $('<div class="time-overview-dom"></div>');

        this.addLinePanel = $('<div class="add-line-panel dropdown-panel" style="height: 400px;">' +
            '<div class="header-dropdown-panel" style="width: 70%;"></div>' +
            '<div class="content-dropdown-panel"><table class="probe-list"></table></div>' +
            '<div class="footer-dropdown-panel">' +
            '<div class="group-name">Group name: ' +
            '<input type="text" class="form-control" placeholder="Group name"></div>' +
            '<button type="button" class="btn btn-default add-line-panel-close">Cancel</button>' +
            '<button type="button" class="btn btn-success add-line"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add</button>' +
            '<button type="button" class="btn btn-success add-group"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Group</button>' +
            '<button type="button" class="btn btn-success add-comparison"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Compare</button>' +
            '</div>' +
            '</div>');

        this.addMeasurementPanel = $('<div class="dropdown-panel" style="height: 160px; width: 500px">' +
            '<div class="header-dropdown-panel">' + lang.addMeasurementHeader+ '</div>' +
            '<div class="content-dropdown-panel">' +
            '<input type="text" class="form-control measurement-id" placeholder="Measurement ID"></div>' +
            '<div class="footer-dropdown-panel">' +
            '<button type="button" class="btn btn-default add-measurement-panel-close">Cancel</button>' +
            '<button type="button" class="btn btn-success add-measurement-submit"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add</button>' +
            '</div>' +
            '</div>');


        this.dom = {};

        env.parentDom.addClass("latencymon-container");
        this.dom.main = $("<div></div>").addClass("latencymon-content").appendTo(env.parentDom);

        this.dom.loadingImage = $(this.loadingImage).appendTo(this.dom.main);

        this.dom.message = $(this.overlayMessage).appendTo(this.dom.main);



        this._moveLoadingImage = function(evt){
            $this.dom.loadingImage
                .css({
                    "left": evt.pageX - $(this).offset().left,
                    "top": evt.pageY - $(this).offset().top
                });
        };


        this.updateInfo = function(){
            var leftHeaderContent, groupsNumber, measurementsNumber;

            leftHeaderContent = lang.leftHeader.noMeasurement;
            measurementsNumber = (env.measurements) ? Object.keys(env.measurements).length : 0;
            groupsNumber = (env.main.groups) ? Object.keys(env.main.groups).length : 0;

            if (groupsNumber == 0){
                leftHeaderContent = lang.leftHeader.noGroups;
            }

            if (measurementsNumber == 1 && groupsNumber > 0){

                for (var msmId in env.measurements){
                    leftHeaderContent = lang.leftHeader.show
                        .replace("%y", env.measurements[msmId].type)
                        .replace("%m", msmId)
                        .replace("%t", env.measurements[msmId].target);
                    break;
                }
            }

            if (measurementsNumber > 1 && groupsNumber > 0){
                for (var msmId in env.measurements){
                    targets.push(env.measurements[msmId].target);
                }
            }

            this.infoHeader.left.text(leftHeaderContent);
            this.infoHeader.right.text(lang.rightHeader.replace("%s", utils.dateToStringShort(utils.UTCDateToLocalDate(env.startDate))).replace("%e", utils.dateToStringShort(utils.UTCDateToLocalDate(env.endDate))));
        };


        this.showLoadingImage = function(show){
            if (show) {
                if (loadingImageCounter == 0) {
                    $($this.dom.main)
                        .on("mousemove", $this._moveLoadingImage);
                    $this.dom.loadingImage
                        .css({
                            "left": "50%",
                            "top": "50%"
                        })
                        .show();

                    if (loadingImageTimer){
                        clearTimeout(loadingImageTimer);
                    }
                    loadingImageTimer = setTimeout(function(){ // Stop with the loading Image, it was a timeout
                        $this.dom.loadingImage.hide();
                        loadingImageCounter = 0;
                    }, 20000);
                }
                loadingImageCounter++;
            } else {
                loadingImageCounter--;
                if (loadingImageCounter == 0) {
                    if (loadingImageTimer){
                        clearTimeout(loadingImageTimer);
                    }
                    $this.dom.loadingImage.hide();
                    $($this.dom.main)
                        .off("mousemove", $this._moveLoadingImage);
                }
            }
        };


        this.bindSlidingMenu = function(callerButton, menuItemsHtml, height, cssClass, callback){
            var timerHide;

            if (insideSubMenu == null){
                this.dom.main.append($this.slidingMenu); // Append the sub menu dom
                slidingMenuOpened = false;
                insideSubMenu = false;

                this.slidingMenu
                    .on("mouseenter", function(){
                        insideSubMenu = true;
                    })
                    .on("mouseleave", function(evt){
                        insideSubMenu = false;
                        if ($(evt.target).attr('class') == $this.slidingMenu.attr('class')){
                            hideSubMenu();
                        }
                    });
            }

            function hideSubMenu(){
                if (insideSubMenu == false){
                    $this.slidingMenu
                        .removeClass(cssClass)
                        .off("click")
                        .hide()
                        .css({
                            height: "0"
                        });
                    slidingMenuOpened = false;
                    //env.parentDom.$.tooltip("enable");
                }
            }

            callerButton
                .on("mouseenter",
                function(){
                    if (slidingMenuOpened == false){
                        clearTimeout(timerHide);
                        slidingMenuOpened = true;
                        $this.slidingMenu.html(menuItemsHtml);

                        $this.slidingMenu
                            .on("click", callback)
                            .addClass(cssClass)
                            .css({
                                left: Math.ceil(callerButton.position().left),
                                top: callerButton.position().top + 20
                            })
                            .show()
                            .animate({
                                height: height
                            }, 300);

                        //env.parentDom.$.tooltip("disable");
                    }
                })
                .on("mouseleave", function(){
                    clearTimeout(timerHide);
                    timerHide = setTimeout(hideSubMenu, 1000);
                });


        };


        this.populateProbeList = function(data){
            var table;

            table = env.parentDom.find('.probe-list');
            if (table.is(".table-condensed")){
                table.bootstrapTable('load', data)
            } else {
                table
                    .addClass("table-condensed")
                    .bootstrapTable({
                        striped: true,
                        clickToSelect: true,
                        checkboxHeader: true,
                        sortOrder: "desc",
                        sortName: "name",
                        pagination: true,
                        showPaginationSwitch: false,
                        pageSize: 8,
                        pageList: [],
                        maintainSelected: true,
                        smartDisplay: true,
                        sidePagination: "client",
                        //singleSelect: true,
                        dataShowPaginationSwitch: true,
                        showFooter: false,
                        sortable: true,
                        search: true,
                        checkedBooleanField: "checked",
                        onCheckAll: function(){
                            var groupName;

                            groupName = env.parentDom.find(".group-name>input");
                            if (groupName.is(":visible")){
                                groupName.val(env.parentDom.find(".search > input").val()).trigger("keyup");
                            }
                        },
                        columns: [
                            {
                                field: 'select',
                                title: 'Select',
                                checkbox: true
                            },
                            {
                                field: 'id',
                                title: 'Probe ID',
                                sortable: true
                            }, {
                                field: 'cc',
                                sortable: true,
                                title: 'Country'
                            }, {
                                field: 'asv4',
                                sortable: true,
                                title: 'ASv4'
                            }, {
                                field: 'asv6',
                                sortable: true,
                                title: 'ASv6'
                            }, {
                                field: 'ipv4',
                                sortable: true,
                                title: 'IPv4'
                            }, {
                                field: 'ipv6',
                                sortable: true,
                                title: 'IPv6'
                            }, {
                                field: 'msmid',
                                sortable: true,
                                title: 'Measurement ID'
                            }
                        ],
                        data: data
                    });
            }
        };


        this._openAddMenu = function(isGroup){
            var probe, data, drawn;

            if (!this.addLinePanelAppended) {
                this.dom.main
                    .append(this.addLinePanel.hide().fadeIn());
                this.addLinePanelAppended = true;

                env.parentDom.find(".add-line-panel-close").on("mouseup", function(){
                    $this.addLinePanel.fadeOut()
                });

                env.parentDom.find(".add-line")
                    .on("mouseup", function(){
                        $.each(env.parentDom.find('.probe-list').bootstrapTable('getSelections'), function(i, item){
                            env.main.addProbe(item.msmid, item.id);
                        });
                        $this.addLinePanel.fadeOut();
                    });


                env.parentDom.find(".add-group")
                    .on("mouseup", function(){
                        var groups;

                        groups = {};
                        $.each(env.parentDom.find('.probe-list').bootstrapTable('getSelections'), function(i, item){
                            if (!groups[item.msmid]){
                                groups[item.msmid] = [];
                            }
                            groups[item.msmid].push(item.id);
                        });
                        for (var measurement in groups){
                            env.main.addGroup(measurement, groups[measurement], env.parentDom.find(".group-name>input").val(), "multi-probes");
                        }

                        $this.addLinePanel.fadeOut();
                    });

                env.parentDom.find(".add-comparison")
                    .on("mouseup", function(){
                        var groups;

                        groups = {};
                        $.each(env.parentDom.find('.probe-list').bootstrapTable('getSelections'), function(i, item){
                            if (!groups[item.msmid]){
                                groups[item.msmid] = [];
                            }
                            groups[item.msmid].push(item.id);
                        });
                        for (var measurement in groups){
                            env.main.addGroup(measurement, groups[measurement], env.parentDom.find(".group-name>input").val(), "comparison");
                        }

                        $this.addLinePanel.fadeOut();
                    });

                env.parentDom.find(".group-name>input")
                    .on("keyup", function(){
                        if ($(this).val().length > 0){
                            env.parentDom.find(".add-group").prop("disabled", false);
                            env.parentDom.find(".add-comparison").prop("disabled", false);
                        } else {
                            env.parentDom.find(".add-group").prop("disabled", true);
                            env.parentDom.find(".add-comparison").prop("disabled", true);
                        }
                    });

            } else {
                this.addLinePanel.fadeIn();
            }

            this.addLinePanel
                .find(".header-dropdown-panel")
                .html(((isGroup) ? lang.selectGroupHeaderText : lang.selectLineHeaderText));

            function isDisplayed(probe){
                for (var group in env.main.groups){
                    if (env.main.groups[group].contains(probe)){
                        return true;
                    }
                }
                return false;
            }

            data = [];
            for (var measurementId in env.main.availableProbes){

                for (var probeId in env.main.availableProbes[measurementId]){

                    probe = env.main.availableProbes[measurementId][probeId];
                    drawn = isDisplayed(probe);

                    if (!isGroup || !drawn){
                        data.push({
                            id: probe.id,
                            msmid: measurementId,
                            cc: probe.country_code,
                            asv4: probe.asn_v4,
                            asv6: probe.asn_v6,
                            ipv4: probe.address_v4,
                            ipv6: probe.address_v6,
                            checked: drawn
                        });
                    }
                }
            }

            if (isGroup){
                env.parentDom.find(".add-line").hide();
                env.parentDom.find(".group-name").show();
                env.parentDom.find(".add-group").prop("disabled", true).show();
                env.parentDom.find(".add-comparison").prop("disabled", true).show();
            } else {
                env.parentDom.find(".add-line").show();
                env.parentDom.find(".group-name").hide();
                env.parentDom.find(".add-group").hide();
                env.parentDom.find(".add-comparison").hide();
            }

            env.parentDom.find(".group-name>input").val("");

            $this.populateProbeList(data);
        };


        this.openAddLineMenu = function(){
            $this._openAddMenu(false);
            $this.addMeasurementPanel.hide();
        };

        this.openAddGroupMenu = function(){
            $this._openAddMenu(true);
            $this.addMeasurementPanel.hide();
        };

        this.openAddMeasurementPanel = function(){
            $this.addLinePanel.hide();
            if (!this.addMeasurementPanelAppended) {
                $this.dom.main
                    .append(this.addMeasurementPanel.hide().fadeIn());
                this.addMeasurementPanelAppended = true;

                env.parentDom.find(".add-measurement-panel-close")
                    .on("mouseup", function(){
                        $this.addMeasurementPanel.fadeOut();
                    });

                env.parentDom.find(".add-measurement-submit")
                    .on("mouseup", function(){
                        env.main.addMeasurement(env.parentDom.find(".measurement-id").val());
                        $this.addMeasurementPanel.fadeOut();
                    });



            } else {
                this.addMeasurementPanel.fadeIn();
            }

            env.parentDom.find(".measurement-id").val("");

        };


    };


    return TemplateManagerView;
});