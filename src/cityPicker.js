(function(factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jqurey')) :
		typeof define === 'function' && define.amd ? define(['jquery'], factory) :
		factory(jQuery);
}(function($) {
	$.fn.cityPicker = function(options) {
		var defaults = {
			baseUrl: ''
		}

		var _this = $(this);
		
		$.extend(true, defaults, options);
		
		var cityData4 = getCityData(defaults.baseUrl);
		
		_this.each(function(){
			initCityBox($(this), cityData4, defaults);
			clickEventLoad($(this), cityData4);
		});
		
		return this;
	}
	
	// 获取省市县区json数据
	function getCityData(baseUrl) {
		var xmlHttpRequest = $.ajax({
			type: "GET",
			url: baseUrl + "/CityPicker/src/pcas.json",
			async: false
		});
		return xmlHttpRequest.responseJSON;
	}

	// 初始化容器盒子
	function initCityBox(_this, cityData4, defaults) {
		_this.css("position", "relative");

		var propNode = '<div class="propBox"></div>';
		_this.append(propNode);

		var cityboxNode = '<div class="cityBox"></div>';
		_this.append(cityboxNode);

		var cityTextNode = '<div class="cityText"><div class="textBody"><ul draggable="true"><li class="province" attr-id=""></li><li class="city" attr-id=""></li><li class="county" attr-id=""></li><li class="town" attr-id=""></li></ul></div></div>';
		var cityPanelNode = '<div class="cityPanel"></div>';
		_this.find('.cityBox').append(cityTextNode).append(cityPanelNode);

		var cityMenuNode = '<div class="city-menu"><a class="current">省份</a><a>城市</a><a>县区</a><a>街道</a></div>';
		var cityListNode = '<div class="city-list"></div>';
		_this.find('.cityPanel').append(cityMenuNode).append(cityListNode);

		var provinceDatas = [];
		cityData4.forEach(function(item, i) {
			var index = 2;
			if(item.code == 15 || item.code == 23) {
				index = 3;
			}
			provinceDatas.push({
				code: item.code,
				name: item.name.slice(0, index)
			});
		});

		// 按首字母升序排序
		provinceDatas.sort(function(a, b) {
			return(a.name).localeCompare(b.name);
		});

		var dlNode1 = '<dl><dt>A-G</dt><dd></dd></dl>';
		var dlNode2 = '<dl><dt>H-K</dt><dd></dd></dl>';
		var dlNode3 = '<dl><dt>L-S</dt><dd></dd></dl>';
		var dlNode4 = '<dl><dt>T-Z</dt><dd></dd></dl>';

		var aNodes1 = '',
			aNodes2 = '',
			aNodes3 = '',
			aNodes4 = '';

		provinceDatas.forEach(function(item, i) {
			if(0 <= i && i < 8) {
				aNodes1 += '<a title="' + item.name + '" attr-id="' + item.code + '">' + item.name + '</a>';
			} else if(8 <= i && i < 17) {
				aNodes2 += '<a title="' + item.name + '" attr-id="' + item.code + '">' + item.name + '</a>';
			} else if(17 <= i && i < 26) {
				aNodes3 += '<a title="' + item.name + '" attr-id="' + item.code + '">' + item.name + '</a>';
			} else if(26 <= i && i < 31) {
				aNodes4 += '<a title="' + item.name + '" attr-id="' + item.code + '">' + item.name + '</a>';
			}
		})

		var cutindex = dlNode1.indexOf("</dd>");
		dlNode1 = dlNode1.slice(0, cutindex) + aNodes1 + dlNode1.slice(cutindex);
		dlNode2 = dlNode2.slice(0, cutindex) + aNodes2 + dlNode2.slice(cutindex);
		dlNode3 = dlNode3.slice(0, cutindex) + aNodes3 + dlNode3.slice(cutindex);
		dlNode4 = dlNode4.slice(0, cutindex) + aNodes4 + dlNode4.slice(cutindex);

		var provinceNode = '<div class="city-select  city-province">' + dlNode1 + dlNode2 + dlNode3 + dlNode4 + '</div>';
		var cityNode = '<div class="city-select city-city city-hide"><dl><dd class="no-dt"></dd></dl></div>';
		var countyNode = '<div class="city-select city-county city-hide"><dl><dd class="no-dt"></dd></dl></div>';
		var townNode = '<div class="city-select city-town city-hide"><dl><dd class="no-dt"></dd></dl></div>';
		_this.find('.city-list').append(provinceNode).append(cityNode).append(countyNode).append(townNode);

		// 样式设置
		var height = _this.height(),
			width = defaults.width || _this.outerWidth();

		_this.find('.propBox').css({
			'position': 'absolute',
			'left': 10,
			'top': '-40px'
		});

		_this.find('.cityBox').css({
			'width': width
		});
		_this.find('.cityText .textBody').css({
			'height': height
		});
		_this.find('.cityText li').css('line-height', height + 'px');
	}

	// 选择事件加载
	function clickEventLoad(_that, cityData4) {
		var areas = [];
		var obj = _that.find('.cityBox');
		
		// 四级联动展开
		obj.find('.cityText').on('click', function() {
			$(this).siblings('.cityPanel').toggle();
		});

		// 四级联动标题切换
		$(".city-menu a").on('click', function() {
			$(this).addClass("current");
			$(this).siblings().removeClass("current");
			var index = $(this).index();
			$(this).closest('.cityPanel').find('.city-select:eq(' + index + ')').show().siblings().hide();
		});

		// 省份选择
		var cityData = [];
		obj.find('.city-province').on('click', 'a', function() {
			cityData = cityFn(this, cityData4, cityData, areas);
		});

		// 城市选择
		var countyData = [];
		obj.find('.city-city').on('click', 'a', function() {
			countyData = cityFn(this, cityData, countyData, areas);
		});

		// 县区选择
		var townData = [];
		obj.find('.city-county').on('click', 'a', function() {
			townData = cityFn(this, countyData, townData, areas);
		});

		// 区镇选择
		obj.find('.city-town').on('click', 'a', function() {
			var dataId = $(this).attr('attr-id');
			var dataText = $(this).text();
			$(this).addClass('active').siblings().removeClass('active');
			$(this).closest('.cityBox').find('.cityText .town').attr({
				'attr-id': dataId
			}).text(dataText);
			areas[3] = dataText;
			$(this).closest('.cityBox').find('.cityText').trigger('click');

			var areaStr = '';
			areas.forEach(function(item, i) {
				areaStr += item + '/';
			})
			_that.attr('value', areaStr);

			obj.on('mouseenter', function() {
				_that.find('.propBox').text(areaStr).show();
			}).on('mouseleave', function() {
				_that.find('.propBox').hide();
			});

		});
	}

	function cityFn(that, sourceArray, newArray, areas) {
		var dataId = $(that).attr('attr-id');
		var dataText = $(that).text();
		var index = $(that).closest('.city-select').index();

		//是否状态初始化
		if(!$(that).hasClass('active')) {

			//清理文本框之后的数据
			$(that).closest('.cityBox').find('.cityText li').eq(index).nextAll().attr({
				'attr-id': ''
			}).text('');
			$(that).closest('dl').siblings().find('a').removeClass('active');

			// 当前选中添加激活状态
			$(that).addClass('active').siblings().removeClass('active');

			// 给文本框添加数据
			$(that).closest('.cityBox').find('.cityText li').eq(index).attr({
				'attr-id': dataId
			}).text(dataText);
			areas[index] = dataText;

			// 给下一级做准备
			newArray = [];
			for(var i = 0; i < sourceArray.length; i++) {
				if(sourceArray[i].code == dataId) {
					newArray = sourceArray[i].children || [];
					break;
				}
			}

			// 下一级数据展示
			var citysStr = '';
			if(newArray.length > 0) {
				for(var i = 0; i < newArray.length; i++) {
					citysStr += '<a attr-id="' + newArray[i].code + '">' + newArray[i].name + '</a>';
				}
			}

			// 数据填充
			$(that).closest('.cityBox').find('.city-select').eq(index + 1).find('dd').html(citysStr);

			// 四级跳转跟随
			$(that).closest('.cityBox').find('.city-menu a').eq(index + 1).trigger('click');
		} else {

			// 四级跳转跟随
			$(that).closest('.cityBox').find('.city-menu a').eq(index + 1).trigger('click');
		}

		// 返回新数组,以便下一次使用
		return newArray;
	}
}));