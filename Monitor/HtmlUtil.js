var HtmlUtil = HtmlUtil || (function(){
    ///
	var _object = {
        // ID 指定してボタンにイベントリスナを追加する。
        addButtonEventListenerByID : function (id, event)
        {
            const element = document.getElementById(id);
            HtmlUtil.addEventListenerToElement(element, 'click', event);
            return element;
        },

        // エレメントにイベントを追加する
        addEventListenerToElement : function(element, name, event)
        {
            if(element)
            {
                element.addEventListener(name, event);
            }
        },

    	// 子ノードから所定のクラスを持つノードを取得する
	    searchNodeByClassNameFromChildren : function(html_node, classname, default_contents = null)
        {
            const element = html_node.querySelector("." + classname);
            if(element)
            {
                if(default_contents != null)
                {
                    element.innerHTML = default_contents;
                }
                return element;
            }
            else
            {
                console.log(`HtmlUtil.searchNodeByClassName(${html_node}, ${classname}, ${default_contents}) element not found.`);
                return null;
            }
        },

    	// ドキュメントから所定のクラスを持つノードを取得する
        searchNodeByClassNameFromDocument : function(classname)
        {
            const elements = document.getElementsByClassName(classname);
            if (elements.length > 0) {
                return elements[0];
            } else {
                return null;
            }
        },

		// input 要素から数値を取得する
		tryGetInputNumber : function(element)
		{
			const value = element.value.trim();
			if(value !== "")
			{
				const number = Number(value);
				if(!Number.isNaN(number))
				{
					return number;
				}
			}
			return undefined;
		}
    };

    _object.TextDecoder = new TextDecoder('utf-8');
    _object.TextEncoder = new TextEncoder('utf-8');

	// =====================================================================
	// DnDまわり
	// =====================================================================
	function cDragableElement(argElement)
	{
		this.TargetElement = argElement;
		HtmlUtil.addEventListenerToElement(argElement, "pointerdown", this.onDragStart.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointermove", this.onDragMove.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointerup", this.onDragEnd.bind(this));
		HtmlUtil.addEventListenerToElement(argElement, "pointercancel", this.onDragEnd.bind(this));

		this.Draggning = false;
		this.DragPrevX = 0;
		this.DragPrevY = 0;
		this.TransX = 0;
		this.TransY = 0;
	}
	cDragableElement.prototype.onDragStart = function(event)
	{
		event.preventDefault();
		this.Draggning = true;
		this.DragPrevX = event.clientX;
		this.DragPrevY = event.clientY;
	}
	cDragableElement.prototype.onDragMove = function(event)
	{
		if(this.Draggning)
		{
			let dx = event.clientX - this.DragPrevX;
			let dy = event.clientY - this.DragPrevY;
			this.setPosition(this.TransX + dx, this.TransY + dy);
			this.DragPrevX = event.clientX;
			this.DragPrevY = event.clientY;
			this.apply();
		}
	}
	cDragableElement.prototype.onDragEnd = function(event)
	{
		this.Draggning = false;
	}
	cDragableElement.prototype.setPosition = function(x, y)
	{
		this.TransX = x;
		this.TransY = y;
	}
	cDragableElement.prototype.apply = function()
	{
		const grid_size = 16;
		const nx = Math.round(this.TransX/grid_size)*grid_size;
		const ny = Math.round(this.TransY/grid_size)*grid_size;
		this.TargetElement.style.transform = `translate(${nx}px, ${ny}px)`;
	}
    _object.cDragableElement = cDragableElement;

    return _object;
})();
