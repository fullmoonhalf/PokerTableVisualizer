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
        }
    };

    _object.TextDecoder = new TextDecoder('utf-8');
    _object.TextEncoder = new TextEncoder('utf-8');

	return _object;
})();
