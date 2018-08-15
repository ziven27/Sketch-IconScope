import _utils from './_/utils.js';

// let's get a hold on the Sketch API
const sketch = require('sketch/dom');
const Group = sketch.Group;
const Shape = sketch.Shape;
const Rectangle = sketch.Rectangle;

function IconScope(context) {
	let groupName = 'fe/Scope';
	let bgName = '_bg';

	let layers = _utils.getSelectedLayers();

	//啥都没选就什么都不做
	if (!layers.length) {
		_utils.msg("select something 🙌");
		return;
	}

	// 如果选中的是组本身，那么解组
	if (layers.length == 1 && layers[0].name == groupName) {
		layers[0]._object.ungroup();
		_utils.msg("UnScope success 🙌");
		return;
	}

	// 用原生的方式打组
	_utils.groupSelect();
	// 选取打组好的组
	let container = _utils.getSelectedLayers()[0];
	container.name = groupName;
	// 如果没有取到
	if (!container) {
		return;
	}
	// 计算出最合适的尺寸
	let ajustInfo = _utils.getAjustInfo(container.frame);

	//创建矩形
	var slice = MSSliceLayer.new();
	slice.frame().setX(ajustInfo.x);
	slice.frame().setY(ajustInfo.y);
	slice.frame().setWidth(ajustInfo.width);
	slice.frame().setHeight(ajustInfo.height);
	slice.setName(bgName);
	container._object.addLayers([slice]);

	// 让容器包含元素
	container.adjustToFit();

	_utils.msg("Success 🙌");
};

export default IconScope;