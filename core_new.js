// 1、jq框架使用自调主要是为了避免全局变量的污染。
(function( global, factory ) {

    // 这里间接调用factory主要是为了支持模块化开发
    // 因为jquery框架的所有代码都写在了这个函数中，
    // 要让他生效必须要执行一下，同时把全局对象传递过去。
    factory( global );

})( window, function( window ) {

    var version = '1.0.0';

    // 3、jQuery工厂函数的定义
    // 工厂函数存在的意义就是简化用户创建实例时书写的代码数量
    var jQuery = function( selector ) {
        return new jQuery.fn.init( selector );
    };

    // 4、给jQuery工厂函数的原型起一个别名叫fn
    // 起这个别名是为了方便用户使用。
    // 因为jquery框架有一个插件机制，给jquery扩展一个插件，
    // 实际上就是给jQuery原型添加方法，为了方便用户所以起了一个别名。
    jQuery.fn = jQuery.prototype = {

        // 用来获取当前jq版本号
        jquery: version,

        // 补充丢失的constructor属性
        constructor: jQuery,

        // jq实例默认存储的原生DOM数量
        length: 0,

        // 获取指定下标的元素，可以传入负数倒着取，如果没有传入指定下标，那么返回数组
        get: function(num) {
            // 如果num传参了，进一步判断参数是整数还是负数，按照对应的方式取得对应下标的DOM元素，
            // 如果没有传参，那么直接复用toArray方法获取数组返回。
            return num != null?
                    num < 0? this[this.length + num]: this[num]:
                    this.toArray();
        },

        // 获取指定下标的元素，但是这个元素是jq包装过
        eq: function(num) {

            // 复用get方法获取指定下标的元素，然后包装成jq实例
            var node = this.get(num);

            // 创建一个jq空实例
            var $temp = $();
            // 通常情况下，我们创建的jq实例，以下标的方式存储了页面中获取到的原生DOM，
            // 但是我们手动给一个jq实例通过下标添加dom，也是允许的。
            $temp[0] = node;
            $temp.length = 1;

            return $temp;
        },

        // 上面的eq升级版，可以获取上级链
        _eq: function(num) {

            // 复用get方法获取指定下标的元素，然后包装成jq实例
            var node = this.get(num);

            // 通过pushStack方法创建新的实例，这个新实例即存储了node，又记录了上级链
            return this.pushStack([node]);
        },

        // 遍历所有的元素
        each: function(fn) {
            return jQuery.each(this, fn)
        },

        // 通过一组jqDOM，映射得到一个新的jqDOM
        map: function(fn) {
            return jQuery.map(this, fn);
        },

        // 通过指定的参数，创建一个新的实例对象，
        // 这个新的实例对象通过一个属性记录了上级链的jq对象是谁，
        // 最后该方法返回新创建的实例。
        pushStack: function(eles) {
            var $new = jQuery();  // 创建一个空的新实例
            [].push.apply($new, eles);

            // 调用该方法的是老的jq对象，该方法内部创建了一个新的jq对象，新的jq对象存储了老的jq对象
            $new.prevObject = this;
            return $new;
        },

        // 返回新实例的上级链(就是老的那个jq对象)
        end: function() {
            return this.prevObject;
        },

        // 把实例转换成数组返回
        toArray: function() {
            // 通常做法：
            // 1、遍历实例中存储的每一个元素
            // 2、依次添加到一个空数组中
            // 3、最后返回这个空数组
            var arr = [];
            for(var i = 0, len = this.length; i < len; i++) {
                arr.push(this[i]);
            }
            return arr;
        },

        _toArray: function() {
            // 借用数组的slice方法，操作jq实例，把实例的每一个值截取到一个新数组中并返回
            return [].slice.call(this);
        },

        // 如果当前页面中的DOM已经解析完毕，那么函数马上执行，
        // 如果未解析完毕，那么等待解析完毕后函数执行。
        ready: function(fn) {

            // 如果页面结构已经构建完毕，那么函数直接执行
            if(document.readyState == 'interactive' || document.readyState == 'complete') {
                fn();
            }else {
                document.addEventListener('DOMContentLoaded', fn);
            }
        }
    };

    jQuery.extend = jQuery.fn.extend = function() {
        var arg = arguments, argLen = arg.length;   // 把arguments相关的属性进行简写缓存
        var target = arg[0];        // 记录默认要给谁拷贝(默认给第一个对象copy)
        var i = 1;                  // 记录默认从第几个对象开始遍历拷贝(默认从第二个对象开始遍历)

        // 如果只传入1个对象，那么从第一个对象开始遍历，把属性值copy给this
        if(argLen === 1) {
            target = this;
            i = 0;
        }

        // 遍历得到每一个被拷贝的对象， 这里arg[i]代表每一个被拷贝的对象
        for(; i < argLen; i++) {

            // 遍历每一个对象的属性，拷贝给target
            for(var key in arg[i]) {
                target[key] = arg[i][key];
            }
        }

        return target;
    }

    // 5、定义创建jq实例的构造函数，这个构造函数的名字比较特殊，叫init
    // jquery的作者把内置的构造函数放到了两个位置，1个是变量，1个是原型
    var init = jQuery.fn.init = function( selector ) {

        // 〇、$(null、undefined、false、0、''、NaN)
        // 1、不做任何处理。
        // 一、$(传入字符串)
        // 1、传入选择器，去页面获取元素，然后添加到实例中
        // 2、传入html片段，会解析成dom元素，然后添加到实例中
        // 二、$(数组 || 伪数组)
        // 1、把数组中的每一个元素取出来，然后添加到新实例中
        // 2、把伪数组中的每一个元素取出来，然后添加到新实例中
        // 三、$(函数)
        // 1、如果当前页面中的DOM已经解析完毕，那么函数马上执行，
        // 如果未解析完毕，那么等待解析完毕后函数执行。
        // 四、$(其他)
        // 1、直接该数据添加到实例中

        // 传入的值非null、undefined...，那么才进行进一步处理
        if(selector) {

            // string
            if(typeof selector == 'string') {

                // html
                if(selector[0] === '<' && selector[selector.length - 1] === '>' && selector.length >= 3) {
                    
                    // 把html字符串解析成正常的htmlDOM元素，添加到实例中
                    [].push.apply(this, jQuery.parseHTML(selector));
                }

                // selector
                else {
                     // 根据选择器获取页面中的元素,然后依次添加到jq实例上
                     [].push.apply(this, document.querySelectorAll(selector));
                }
            }

            // array || arrayLike
            else if(jQuery.isArrayLike(selector)) {
                [].push.apply(this,selector);
            }

            // function
            else if(typeof selector == 'function') {
                this.ready(selector);
            }

            else {
                this[0] = selector;
                this.length = 1;
            }
        }
    };

    // 6、让构造函数的原型与工厂函数的原型保持一致
    // 保持一致是为了实现jquery插件机制。
    init.prototype = jQuery.fn;

    // 2、把内部的jQuery工厂函数，使用两个变量暴露到全局，供用户使用
    // 对外暴露工厂而不是构造函数，主要是为了用户体验而考虑的，这样用户创建实例不用new了。
    window.jQuery = window.$ = jQuery;

    // 给jQuery与$添加一些静态方法
    jQuery.extend({

        // 把html字符串解析为DOM元素并返回
        parseHTML: function(html) {
            // 1、创建一个临时的DOM
            // 2、然后给这个临时的DOM设置innerHTML为参数
            // 3、返回临时DOM的子元素，子元素就是html字符串解析好的DOM
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            return tempDiv.childNodes;
        },

        // 判断一个对象是不是数组或者伪数组
        // 伪数组：具有length属性，具有length-1最大下标属性
        isArrayLike: function(obj) {
            // 1、如果obj不是对象返回false
            // 2、如果obj是window对象返回false
            // 3、如果obj是function对象返回false，
            // 4、判断是不是真数组，是返回true
            // 5、判断obj是不是伪数组
            // 5.1、判断obj的length属性是否全等与0，如果是返回true
            // 5.2、如果length不为0，判断length属性是不是正数，
            //      如果是继续判断有没有length-1最大下标属性，如果有返回true

            // 1、如果obj不是对象返回false
            if(!jQuery.isObj(obj)) {
                return false;
            }

            // 2、如果obj是window对象返回false
            if(obj === window) {
                return false;
            }

            // 3、如果obj是function对象返回false
            if(typeof obj == 'function') {
                return false;
            }

            // 4、判断是真数组返回true
            if(({}).toString.call(obj) == '[object Array]') {
                return true;
            }

            // 5、判断obj是不是伪数组
            // 5.1、判断obj的length属性是否全等与0，如果是返回true
            // 5.2、如果length不为0，判断length属性是不是正数，
            //      如果是继续判断有没有length-1最大下标属性，如果有返回true
            if(obj.length === 0) {
                return true;
            }

            if(obj.length > 0 && (obj.length - 1) in obj ) {
                return true;
            }

            return false;
        },

        _isArrayLike: function(obj) {

            // 如果obj不是对象，或者是window，或者是函数，那么不是数组或伪数组，返回false
            if(!jQuery.isObj(obj) || typeof obj == 'function' || obj === window) {
                return false;
            }

            // 如果是真数组、或者length为0是伪数组，或者length为正数，有最大下标值也是伪数组返回true。
            // 如果三者都不满足，那么返回false。
            return (({}).toString.call(obj) == '[object Array]') || (obj.length === 0) || 
                ((obj.length > 0 && (obj.length - 1) in obj));

        },

        // 判断参数是不是对象
        isObj: function(obj) {
            return (typeof obj == 'object' && obj !== null) || typeof obj == 'function';
        },

        // 实现的这个each作用是帮助用户遍历对象或者数组
        each: function(obj, fn) {

            // 判断是不是数组，是采用for(var i)形式遍历
            // 是数组或者伪数组，那么以下标的方式进行遍历
            if(jQuery.isArrayLike(obj)) {
                for(var i = 0, len = obj.length; i < len; i++) {

                    // 仅仅是为了传入下标与值
                    // fn(i, obj[i]);

                    // 在上面的基础上，修改了回调的this为值
                    // 把遍历到的下标与值传给用户的回调使用，同时改变用户回调的this为值
                    // fn.call(obj[i], i, obj[i])

                    // 判断用户的回调有没有返回false，如果有，那么证明用户想让我们停止遍历
                    if(fn.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }
            // 否则认为是对象，采用for in遍历
            else {
                for(var key in obj) {
                    // fn(key, obj[key]);

                    // fn.call(obj[key], key, obj[key]);

                    if(fn.call(obj[key], key, obj[key]) === false) {
                        break;
                    }
                }
            }

            // 遍历谁返回谁
            return obj;
        },

        // 静态版map方法
        map: function(obj, fn) {

            var result = [], temp;

            // 是数组或者伪数组，那么以下标的方式进行遍历
            if(jQuery.isArrayLike(obj)) {
                for(var i = 0, len = obj.length; i < len; i++) {
                    // fn(obj[i], i);

                    // jq的静态map没有改变this，实例的map改变了
                    // 我们这里在实现的时候，不管是静态还是实例，统一都修改this
                    // fn.call(obj[i], obj[i], i);

                    temp =  fn.call(obj[i], obj[i], i);
                    // 如果回调的结果非null、非undefine，那么把这个结果存储起来
                    temp != null && result.push(temp);
                }
            }
            // 否则认为是对象
            else {
                for(var key in obj) {
                    temp = fn.call(obj[key], obj[key], key);
                    temp != null && result.push(temp);
                }
            }

            // 把接收到的所有回调返回值，一起返回出去
            return result;
        }
    })
});
