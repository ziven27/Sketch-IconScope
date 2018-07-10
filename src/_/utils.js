/**
 * 基础库
 * detach:解锁symbol
 * getCurrentArtBoard:获取当前选中元素的artboard
 * msg:显示信息
 * getLastLayer:获取最后一个子元素
 * getGroupWithAllSon:获取该层所有元素的拷贝
 * getColorByString:根据颜色字符串转换成sketch需要的颜色对象
 * setFillColor:设置fill的颜色
 * setBorderColor:设置边框的颜色
 * checkTextLayer:校验文本的信息
 * appendLayers:添加元素
 * replaceLayerByShapes:用形状替换一个层
 * getShapeByData:获取一个层的形状
 * getSelectedLayers:获取选中的图层
 * getTextStyles:获取Text图层的样式
 * getAjustInfo:获取frame最合适的尺寸
 * groupSelect:用sketch默认方式给layer打组 * 
 * 
 */

const sketch = require('sketch/dom');
const _api = context;
const _doc = _api.document;

let utils = {};

/**
 * [detach 解锁symbol]
 * @param  {[type]} layer   [description]
 * @return {[type]}         [description]
 */
utils.detach = function(group, eachKids) {
	var detach = function(it) {
		var layerType = it.className();
		var layerName = it.name();
		if (layerName.charAt(0) == '_') {
			it.removeFromParent();
			return;
		}

		var isPass = eachKids(it) || true;
		if (!isPass) {
			return;
		}
		if (layerType == 'MSSymbolInstance') {
			var newGroup = it.detachByReplacingWithGroup();
			newGroup.children().forEach(function(layer, index) {
				// 忽略第一个
				if (index == 0) {
					return;
				}
				detach(layer);
			});
			return;
		}

	};
	group.children().forEach(function(layer, index) {
		// 忽略第一个
		if (index == 0) {
			return;
		}
		detach(layer);
	});
};

/**
 * [forEachKids 遍历所有不带下划线开头的子孙]
 * @param  {[type]}   it       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
utils.forEachKids = function(it, callback) {
	var _it = this;
	it.layers().forEach(function(layer) {
		var name = layer.name();
		if (name.charAt(0) == '_') {
			layer.removeFromParent();
			return;
		}
		callback(layer);
		if (layer.layers) {
			_it.forEachKids(layer, callback);
		}
	});
};

/**
 * [getCurrentArtBoard 获取当前选中元素的artboard]
 * @return {[type]} [description]
 */
utils.getCurrentArtBoard = function() {
	var _it = this;

	// 获取当前选中第一个元素所在的画板
	var selections = _api.selection;
	if (!selections.count()) {
		_it.msg();
		return false;
	}
	var artBoard = selections[0].parentArtboard();
	if (!artBoard) {
		_it.msg('Please select something 😊');
		return false;
	}

	// 一个子元素都没有就什么都不做
	var layersNum = artBoard.layers().count();
	if (!(layersNum > 0)) {
		_it.msg('This is an empty artboard 😊');
		return false;
	}

	return artBoard;
};

/**
 * [msg 显示信息]
 * @param  {[type]} msg [description]
 * @return {[type]}     [description]
 */
utils.msg = function(msg) {
	!!msg && _doc.showMessage(msg);
};

/**
 * [getLastLayer 获取最后一个子元素]
 * @param  {[type]} parentGroup [description]
 * @return {[type]}             [description]
 */
utils.getLastLayer = function(parentGroup) {
	var layers = parentGroup.layers();
	return layers[layers.count() - 1];
};

/**
 * [getGroupWithAllSon 获取该层所有元素的拷贝]
 * @param  {[type]} parentGroup [description]
 * @return {[type]}             [description]
 */
utils.getGroupWithAllSon = function(parentGroup) {
	// 创建一个空的Group
	var group = MSLayerGroup.new();

	// 遍历这个画板里面的所有子元素
	parentGroup.layers().forEach(function(layer) {
		var name = layer.name();

		// 如果子元素的名字是'_fe'那么删除
		// 如果自元素是以下划线开头则什么都不做
		if (name.substr(0, 3) == '_fe') {
			layer.removeFromParent();
		} else if (name.charAt(0) != '_') {
			var duplicate = layer.copy();
			group.insertLayers_beforeLayer_([duplicate], layer);
		}
	});

	return group;
};


/**
 * [getGroupWithAllSon 获取该层所有元素的拷贝]
 * @param  {[type]} parentGroup [description]
 * @return {[type]}             [description]
 */
utils.getOneSelection = function() {
	var _it = this;
	var selections = _api.selection;
	var selectionsNum = selections.count();
	if (!selectionsNum) {
		_it.msg('Please select something 😊');
		return false;
	} else if (selectionsNum != 1) {
		_it.msg('Please select only 1 thing, you selecte ' + selectionsNum);
		return false;
	}

	var selection = selections[0];
	if (selection.name().charAt(0) == '_') {
		_it.msg('your selection is start with "_" 😢');
		return;
	}

	if (selection.layers && !selection.layers().count()) {
		_it.msg('your selection is empty 😢');
		return false;
	}

	return selection;
};

/**
 * [getCopyGroup 获取这个对象的拷贝到一个组]
 * @param  {[type]} it [description]
 * @return {[type]}    [description]
 */
utils.getCopyGroup = function(it) {
	// 创建一个空的Group
	var group = MSLayerGroup.new();
	var copyLayer = function(layer) {
		var duplicate = layer.copy();
		group.insertLayers_beforeLayer_([duplicate], layer);
	};
	var type=it.className();
	if ((type == 'MSLayerGroup')||type=='MSArtboardGroup') {
		// 遍历这个画板里面的所有子元素
		it.layers().forEach(function(layer) {
			var name = layer.name();
			// 如果子元素的名字是'_fe'那么删除
			// 如果自元素是以下划线开头则什么都不做
			if (name.substr(0, 3) == '_fe') {
				layer.removeFromParent();
			} else if (name.charAt(0) != '_') {
				copyLayer(layer);
			}
		});
	} else {
		copyLayer(it);
	}

	return group;
};

/**
 * [createFeGroup 根据对象获取fe组]
 * @param  {[type]} it [description]
 * @return {[type]}    [description]
 */
utils.createFeGroup = function(it) {
	var _it = this;
	var type = it.className();
	// 判断是否为Artboard
	if ((type == 'MSArtboardGroup') || (type == 'MSLayerGroup')) {
		var wrapper = it;
	} else {
		var wrapper = it.parentGroup();
	}
	// 如果能找到'_fe'文件夹就直接删掉，然后理解为是第二次操作
	var lastLayer = _it.getLastLayer(wrapper);
	if (lastLayer.name() == '_fe') {
		lastLayer.removeFromParent();
	}
	var feGroup = _it.getCopyGroup(it);
	feGroup.setName('_fe');
	// group.setIsSelected(true);
	feGroup.setIsLocked(true);

	// 要先添加到dom里面才能解除组件
	wrapper.addLayers([feGroup]);

	// 重新获取 '_fe' 文件夹
	feGroup = _it.getLastLayer(wrapper);

	return feGroup;
};

/**
 * [getColorByString 根据颜色字符串转换成sketch需要的颜色对象]
 * @param  {[type]} colorString [description]
 * @return {[type]}             [description]
 * Hex
 * MSColorFromString("#33AE15")
 * MSColorFromString("#333")
 * MSColorFromString("FF0000")
 * MSColorFromString("#145515FF")
 *
 * rgb/rgba
 * MSColorFromString("rgb(255,0,0)")
 * MSColorFromString("rgba(255,0,0,0.5)")
 *
 * Color keywords
 * MSColorFromString("red")
 * MSColorFromString("blue")
 * MSColorFromString("magenta")
 * MSColorFromString("darkviolet")
 *
 * hls
 * MSColorFromString("hsl(270, 60%, 50%, .15)")
 * MSColorFromString("hsl(270deg, 60%, 70%)")
 * MSColorFromString("hsl(4.71239rad, 60%, 70%)")
 * MSColorFromString("hsla(240, 100%, 50%, .4)")
 * 
 */
utils.getColorByString = function(colorString) {
	return MSImmutableColor.colorWithSVGString(colorString).newMutableCounterpart();
};

/**
 * [setFillColor 设置fill的颜色]
 * @param {[type]} it    [description]
 * @param {[type]} color [description]
 * var fill = it.style().addStylePartOfType(0);
 * fill.color = MSColor.colorWithRGBADictionary({r: 0.8, g: 0.1, b: 0.1, a: 0.5});
 */
utils.setFillColor = function(shape, color) {
	// 设置背景颜色
	var fill = shape.style().addStylePartOfType(0);
	fill.color = this.getColorByString(color);
};

/**
 * [setFillColor 设置边框的颜色]
 * @param {[type]} it    [description]
 * @param {[type]} color [description]
 * var fill = it.style().addStylePartOfType(0);
 * fill.color = MSColor.colorWithRGBADictionary({r: 0.8, g: 0.1, b: 0.1, a: 0.5});
 */
utils.setBorderColor = function(shape, color, thickness) {
	var border = shape.style().addStylePartOfType(1);
	border.color = this.getColorByString(color);
	border.thickness = thickness || 1;
};

/**
 * [checkTextLayer 校验文本的信息]
 * @param {[type]} info  [description]
 * @param {[type]} layer [description]
 */
utils.checkTextLayer = function(layer) {

	// 如果文字没有使用共享样式报错
	if (!layer.style().sharedObjectID()) {
		return 'No share textStyle';
	}

	// 如果行高不存在报错
	var lineHeight = layer.lineHeight();
	if (!lineHeight) {
		return 'No lh';
	}

	// 高度不是行高的固定倍数报错
	var height = layer.frame().height();
	if (height % lineHeight != 0) {
		return 'h % lh != 0';
	}

	return true;
};
/**
 * [appendLayers 添加元素]
 * @param  {[type]} parent [要添加的父级容器]
 * @param  {[type]} items  [要添加的元素]
 * @return {[type]}        [description]
 */
utils.appendLayers = function(parent, items) {
	var bros = parent.layers();
	var brosNum = bros.count();
	if (brosNum > 0) {
		var lastBro = bros[0];
		parent.insertLayers_beforeLayer(items, lastBro);
	} else {
		parent.addLayers(items);
	}
};

/**
 * [replaceLayerByShape 用形状替换一个层]
 * @param  {[type]} shape [description]
 * @param  {[type]} layer [description]
 * @return {[type]}       [description]
 */
utils.replaceLayerByShapes = function(layer, items) {
	layer.parentGroup().insertLayers_beforeLayer(items, layer);
	layer.removeFromParent();
};


/**
 * [getEmptyShapeByLayer 获取一个层的形状]
 * @param  {[type]} layer [description]
 * @return {[type]}       [description]
 */
utils.getShapeByData = function(data) {
	var _it = this;

	// 获取形状大小
	var cgRect = CGRectMake(data.x, data.y, data.w, data.h);

	// 创建形状
	var newShape = MSShapeGroup.shapeWithRect_(cgRect);

	// 设置名字
	data.name && newShape.setName_(data.name);

	if (data.showType == 0) {
		// 显示地貌
		var color = (data.error) ? 'rgba(255,0,0,0.2)' : 'rgba(0,0,0,0.1)';
		_it.setFillColor(newShape, color);
	} else if (data.showType == 1) {
		// 显示线框
		var color = (data.error) ? 'rgba(255,0,0,1)' : 'rgba(0,255,255,0.8)';
		_it.setBorderColor(newShape, color, 0.5);
	}

	return newShape;
};

/**
 * [selectedLayers 获取选中的图层]
 * @return {[type]} [description]
 */
utils.getSelectedLayers = function() {
	const document = sketch.fromNative(_doc);
	return document.selectedLayers.layers;
};

/**
 * [getTextStyles 获取Text图层的样式]
 * @param  {[type]} text [textLayer]
 * @return {[type]}      [description]
 */
utils.getTextStyles = function(text) {
	const fontSize = text.fontSize();
	const fontFamily = text.fontPostscriptName().split('-')[0];
	const fontWeight = text.fontPostscriptName().split('-')[1];
	const lineHeight = text.lineHeight();
	const color = '#' + text.textColor().NSColorWithColorSpace(nil).hexValue();
	return {
		fontSize,
		fontFamily,
		fontWeight,
		lineHeight,
		color
	}
};

/**
 * [getAjustInfo 获取frame最合适的尺寸]
 * @param  {[type]} frame [description]
 * @return {[type]}       [description]
 */
utils.getAjustInfo = function(frame) {
	let x = frame.x;
	let y = frame.y;
	let w = frame.width;
	let h = frame.height;
	let maxLen = (w > h) ? w : h;
	let newW = Math.ceil((maxLen + 1) / 4) * 4;
	let newX = Math.ceil((newW - w) / 2 * -1);
	let newY = Math.ceil((newW - h) / 2 * -1);
	return {
		x: newX,
		y: newY,
		width: newW,
		height: newW
	};
};

/**
 * [groupSelect 用sketch默认方式给layer打组 ]
 * sketch 论坛 http://sketchplugins.com/d/771-how-to-trigger-group-selection
 * @return {[type]} [description]
 */
utils.groupSelect = function() {
	_doc.actionsController().actionForID("MSGroupAction").doPerformAction(nil);
};

/**
 * [groupLayers 将选中的layer用group包裹起来，类似 ctrl+g ]
 * 但是会改变原始图层的位置，感觉还是用groupSelect比较好 所以被弃用了
 * @param  {[type]} layers [description]
 * @return {[type]}        [description]
 */
// utils.groupLayers = function(layers, name) {
// 	if (!(layers && layers.length > 0)) {
// 		return false;
// 	}
// 	let parent = layers[0].parent;
// 	if (!parent) {
// 		parent = sketch.Page.fromNative(layers[0].sketchObject.parentPage())
// 	}
// 	let container = new sketch.Group({
// 		layers: layers,
// 		name: name || '_',
// 		parent: parent
// 	});
// 	container.adjustToFit();
// 	return container;
// };

export default utils;