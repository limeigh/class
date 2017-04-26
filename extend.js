jQuery.fn.extend({

    // appendTo：把自己作为子元素添加到指定父元素中，该方法返回所有被添加的子元素
    // 把一堆子元素添加到另外一堆父元素身上
    // 1、$('a').appendTo('section');
    // 2、$('a').appendTo( $('section') );
    // 3、$('a').appendTo( document.querySelector('section') );
    appendTo: function(parents) {
        
        // 1、使用$对参数进行统一处理，统一得到jq实例
        // 2、遍历得到每一个父元素
        // 3、遍历每一个子元素，这些子元素要分别添加到每一个父元素中
        // 3.1、只有第一遍被添加的子元素是本体
        // 3.2、后续被添加的子元素都是本体的克隆版
        // 4、使用一个数组存储所有被添加的子元素
        // 5、把数组包装成新实例返回(这里调用pushStack方法帮我们创建新实例，同时还可以记录上级链)
        var $parents = jQuery(parents);
        var $sons = this;
        var result = [], temp;

        // 遍历父
        $parents.each(function(i, parent) {

            // 遍历子
            $sons.each(function(j, son) {
                
                // 数组存储所有被添加的子元素
                // 只有第一个父添加的子元素是本地，以后添加的是克隆版本
                temp = i == 0? son: son.cloneNode(true);
                result.push(temp);
                parent.appendChild(temp);
            });
        });

        // 把所有被添加的子元素包装成新实例(记录了上级链)返回
        return this.pushStack(result);
    },
    hasClass:function(className){
        var has=false
        this.each(function(i,v){
            if((' '+this.className+' ').indexOf(' '+className+' ')>-1){
                has =true
               return false
            }
        })
        return has
    },
    addClass:function(className){
        this.each(function(i,v){
            var that=this
            $.each(className.split(' '),function(i,v){
                if(!$(that).hasClass(v)){
                    that.className += ' '+className
                }
            })
            that.className=(that.className).trim()
        })
        return this
    },
    removeClass:function(className){
        if(arguments.length == 0){
            this.each(function(){
                this.className=''
            })
        }else{
            var classArr=className.split(' ')
            this.each(function(){
                var that=this
                $.each(classArr,function(i,v){
                    that.className=((' '+that.className+' ').replace(' '+v+' ',' ')).trim()
                })
            })
        }
        return this
    },
    toggleClass:function(className){
        var classArr=className.split(' ')
        this.each(function(){
            var $that=$(this)
            $.each(classArr,function(i,v){
                $that.hasClass(v)?$that.removeClass(v):$that.addClass(v)
            })
        })
        return this
    }
});

