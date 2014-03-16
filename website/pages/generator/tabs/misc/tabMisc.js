define([
	"constants",
	"mediator",
	"utils",
	"hbs!miscTabTemplate"
], function(C, mediator, utils, miscTabTemplate) {
	"use strict";

	var _MODULE_ID = "miscTab";
	var _proofEnabled = false;
	var _proofLoading = true;
	var _canvasHeight = null;
	var _canvasWidth = null;


	var _init = function() {
		mediator.register(_MODULE_ID);

		var subscriptions = {};
		subscriptions[C.EVENT.DEMO_PIE.DATA_CHANGE] = _onDataChange;
		subscriptions[C.EVENT.DEMO_PIE.EXAMPLE_CHANGE] = _onExampleChange;
		mediator.subscribe(_MODULE_ID, subscriptions);
	};

	var _render = function(tabEl, config) {
		_canvasWidth = config.size.canvasWidth;
		_canvasHeight = config.size.canvasHeight;

		$(tabEl).html(miscTabTemplate({ config: config }));

		utils.addColorpicker("backgroundColor");
		$("input[name=backgroundColorType]").on("change", function() {
			mediator.publish(_MODULE_ID, C.EVENT.DEMO_PIE.RENDER.NO_ANIMATION);
		});
		$("#backgroundColor").on("focus", function() {
			$("#backgroundColor2")[0].checked = true;
			$("#backgroundColorGroup").colorpicker("show");
			mediator.publish(_MODULE_ID, C.EVENT.DEMO_PIE.RENDER.NO_ANIMATION);
		});

		utils.addColorpicker("segmentStrokeColor");

		if (Modernizr.webgl) {
			$("#transparencyProof").removeClass("hidden").on("click", _toggleProof);
		}
	};

	var _getTabData = function() {
		var backgroundColor = null;
		var selectedBackgroundColorType = $("input[name=backgroundColorType]:checked").val();
		if (selectedBackgroundColorType === "solid") {
			backgroundColor = $("#backgroundColor").val();
		}

		return {
			colors: {
				background: backgroundColor,
				segmentStroke: $("#segmentStrokeColor").val()
			},
			canvasPadding: {
				top: parseInt($("#canvasPaddingTop").val(), 10),
				right: parseInt($("#canvasPaddingRight").val(), 10),
				bottom: parseInt($("#canvasPaddingBottom").val(), 10),
				left: parseInt($("#canvasPaddingLeft").val(), 10)
			},
			pieCenterOffset: {
				x: parseInt($("#pieCenterOffsetX").val(), 10),
				y: parseInt($("#pieCenterOffsetY").val(), 10)
			}
		};
	};

	/**
	 * Listen for data changes so we can keep track of the current canvas size.
	 * @param msg
	 * @private
	 */
	var _onDataChange = function(msg) {
		_canvasWidth = msg.data.config.size.canvasWidth;
		_canvasHeight = msg.data.config.size.canvasHeight;
	};

	var _onExampleChange = function() {
		if (_proofEnabled) {
			_stop();
		}
	};

	var _toggleProof = function() {
		if ($("#three_js").length === 0) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "website/libs/three.js";
			script.id = "three_js";
			document.body.appendChild(script);
		}

		if (_proofEnabled) {
			_stop();
		} else {
			$("#transparencyProof").removeClass("label-default").addClass("label-danger").html("Alright, stop the birds!");

			var interval = setTimeout(function() {
				if ($("#three_js").length !== 0) {
					clearInterval(interval);
					require(["birds"], function(birds) {
						birds.init(_canvasWidth, _canvasHeight);
						birds.start();
						_proofEnabled = true;
						_proofLoading = false;
					});
				}
			}, 50);
		}
	};

	var _stop = function() {
		$("#transparencyProof").removeClass("label-danger").addClass("label-default").html("Prove it again.");
		require(["birds"], function(birds) {
			birds.stop();
		});
		_proofEnabled = false;
	};


	_init();

	return {
		render: _render,
		getTabData: _getTabData
	};
});