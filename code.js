

class FrameMaker{
    constructor(id,targetid){
        this.el =document.getElementById(id)||null
        this.ismobile=false  // 检测设备是pc还是手机
        this.startDraw=false  //是否准备开始移动
        this.ghostFrame=null

        this.target = document.getElementById(targetid)


        this.oldCoordinate={
            x:0,
            y:0
        }
        this.moveCoordinate={
            x:0,
            y:0
        }

        //事件列表
        this.event=[
            {
                element:this.el,
                trigger:['mousedown','touchstart'],
                func:this.toStartMove
            },
            {
                element:window,
                trigger:['mousemove','touchmove'],
                func:this.moveToDraw
            },
            {
                element:window,
                trigger:['mouseup','touchend'],
                func:this.toFinishMove
            }
        ]


        if(this.el){
            this.el.style.position = 'relative'
       
            this.init()
        }
    }
    init(){
 
        document.onselectstart=new Function("event.returnValue=false"); 


        this.checkIsMobile()
        this.bind()       
        
    }
    checkIsMobile(){
        
        function mobile(){
            try{
                document.createEvent('TouchEvent')
                return true
            }
            catch(e){
                return false
            }
        }

        this.ismobile = mobile()
    }
    bind(){
        
        if(this.ismobile){
            for(let i=0;i<this.event.length;i++){
                
                this.event[i].element.addEventListener(this.event[i].trigger[1],this.event[i].func.bind(this))
            }
        }else{
            for(let i=0;i<this.event.length;i++){
            
                this.event[i].element.addEventListener(this.event[i].trigger[0],this.event[i].func.bind(this))
            }
        }
        
        
    }
    unbind(){
        if(this.ismobile){
            for(let i=0;i<this.event.length;i++){
                
                this.event[i].element.removeEventListener(this.event[i].trigger[1],this.event[i].func)
            }
        }else{
            for(let i=0;i<this.event.length;i++){
            
                this.event[i].element.removeEventListener(this.event[i].trigger[0],this.event[i].func)
            }
        }
    }
    toStartMove(e){
       
        console.log('准备开始移动')
        this.startDraw=true
        
        this.oldCoordinate={
            x:e.clientX,
            y:e.clientY
        }
        this.resetChosedList()
        this.createGhostFrame()
    }
    moveToDraw(e){
        if(!this.startDraw)return
        
        this.moveCoordinate={
            x:e.clientX,
            y:e.clientY
        }

        this.updateGhostFrame(this.moveCoordinate)        
    }
    toFinishMove(e){
       
        this.startDraw=false
        this.removeGhostFrame()
         
    }

    createGhostFrame(){
        this.ghostFrame = document.createElement('div')
        this.ghostFrame.className='ghost'
        this.ghostFrame.style.position='absolute'
        this.el.append(this.ghostFrame)
    }
    updateGhostFrame(data){
        let t =this.getAbsoluteValue(data)  //取绝对值,ghostframe的宽高
        this.ghostFrame.style.width=t.width+'px'
        this.ghostFrame.style.height=t.height+'px'
   

        let getleft = ()=>{
            if(data.x>this.oldCoordinate.x){
                return this.oldCoordinate.x-this.el.offsetLeft+'px'
            }else if(data.x<this.oldCoordinate.x&&data.x>this.el.offsetLeft){
                return data.x-this.el.offsetLeft+'px'
            }else{
                return 0 +'px'
            }
        }
        let gettop = ()=>{
            if(data.y>this.oldCoordinate.y){
                return this.oldCoordinate.y-this.el.offsetTop+'px'
            }else if(data.y<this.oldCoordinate.y&&data.y>this.el.offsetTop){
                
                return data.y-this.el.offsetTop+'px'
            }else if(data.y<this.el.offsetTop){
                return 0 +'px'
            }
        }

        this.ghostFrame.style.left = getleft()
        this.ghostFrame.style.top = gettop()
        
        //实时获取选中的list

        this.getChosedFileList()
    }
    getAbsoluteValue(data){
        let obj={
            width:null,
            height:null
        }
      
        if(data.x<this.el.offsetLeft){
            obj.width=this.oldCoordinate.x-this.el.offsetLeft
        }else if(data.x>(this.el.offsetLeft+this.el.offsetWidth)){  
            obj.width=this.el.offsetWidth+this.el.offsetLeft-this.oldCoordinate.x
     
        }else{
            obj.width = (data.x>this.oldCoordinate.x)?(data.x-this.oldCoordinate.x):(this.oldCoordinate.x-data.x)
        }
        
        
        if(data.y<this.el.offsetTop){
            obj.height = this.oldCoordinate.y-this.el.offsetTop
        }else if(data.y>this.el.offsetTop&&data.y<(this.el.offsetTop+this.el.offsetHeight)){
            obj.height = (data.y>this.oldCoordinate.y)?(data.y-this.oldCoordinate.y):(this.oldCoordinate.y-data.y)
        }else {
            obj.height = this.el.offsetHeight+this.el.offsetTop-this.oldCoordinate.y
        }


        
        
        return obj
    }

    removeGhostFrame(){
        if(!this.ghostFrame) return
        //消除frame的时候获取选中的list，性能节省一点

        // this.getChosedFileList()

        let childs = this.el.childNodes
        
        for(let i=0;i<childs.length;i++){
        
            if(childs[i].className==='ghost'){
                this.el.removeChild(childs[i])
            }
            
        }
        this.ghostFrame=null
    }

    getChosedFileList(){
       
        if(this.target==null) return
        
        this.resetChosedList()

        for(let i=0;i<this.target.childNodes.length;i++){
            let t =this.target.childNodes[i]
        
            //如果t的中心点point在frame中间，那么该t会被选中
            let point={
                x:t.offsetLeft+t.offsetWidth/2,
                y:t.offsetTop+t.offsetHeight/2
            }
            // debugger
      
            // this.ghostFrame
            // debugger
            // if(point.y>this.ghostFrame.style.top&&point.y<(this.ghostFrame.style.top+this.ghostFrame.offsetHeight)&&point.x>this.ghostFrame.style.left&&point.x<(this.ghostFrame.style.left+this.ghostFrame.offsetWidth)){
            //     console.log(t)
            // }
            
            if(point.x>this.ghostFrame.offsetLeft&&point.x<(this.ghostFrame.offsetLeft+this.ghostFrame.offsetWidth)&&point.y>this.ghostFrame.offsetTop&&point.y<(this.ghostFrame.offsetTop+this.ghostFrame.offsetHeight)){
                this.renderPickedChosed(t)
            }

        }
        
        
       

    }
    renderPickedChosed(target){
        target.classList.add('chosed')
    }
    resetChosedList(){
        if(this.target==null) return
        for(let i=0;i<this.target.children.length;i++){
            let t =this.target.children[i]
          
            t.classList.remove('chosed')

        }
    }
    destroy(){

        console.log('销毁实例')
        this.unbind()
        
    }
}
export {FrameMaker}


class MakeChild extends FrameMaker{
    constructor(id,list){
        super()
        this.element=document.getElementById(id)||null
        this.list=list
        if(this.element){
            this.init()
        }
        
    }
    init(){
        for(let i=0;i<this.list.length;i++){
            this.createDom(this.list[i])
        }
        this.bind()
    }
    createDom(data){
        let t = document.createElement('div')
        t.innerHTML=data.text
        this.element.append(t)
    }
    bind(){
        this.element.addEventListener('click',this.choseFile.bind(this))
    }
    unbind(){
        this.element.removeEventListener('click',this.choseFile)
    }
    choseFile(e){

        let t = e.target
        this.resetChosedList()
   
        t.classList.add('chosed')
    }
}
export {MakeChild}