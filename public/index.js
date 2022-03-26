const socket=io();
const $message=document.getElementById('message');
const $sendbutton=document.getElementById('sendbtn');

const $viewmessages=document.getElementById('messages');
///temp
const templet=document.getElementById('message-templet').innerHTML;
const locationtemplet=document.getElementById('location-templet').innerHTML;
const sidebartemp=document.getElementById('sidebar-temp').innerHTML;
const imagetemp=document.getElementById('image-templet').innerHTML;
//opt
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
//

//file Data
let fileStatus=false
let file=''
const fileData=document.getElementById('file-change');
fileData.addEventListener('change',(e)=>{

   file =e.target.files[0];
 fileStatus=true
$message.value=file.name;

   })

//autoscroll

const autoscroll=()=>{
     $viewmessages.scrollTop=$viewmessages.scrollHeight
/*
//new mesage
const $newMessage=$message.lastElementChild;

//hight of new message
const newmessagestyles=getComputedStyle($newMessage)
const newMessageMargin=parseInt(newmessagestyles.marginBottom)
const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

//Visible height

const visibleheight=$message.offsetHeight
//height of messages container
const containerHeight=$message.scrollHeight

//how far i scrolled
const scrollOffset=$message.scrollTop+visibleheight
if(containerHeight - newMessageHeight <= scrollOffset){

    $message.scrollTop=$message.scrollHeight

}
*/

}

//
socket.on('Message',(message)=>{

    if(typeof message.text === 'object'){

        const blob =new Blob([message.text.body],{type:message.text.mimeType});
     ///
console.log(URL.createObjectURL(blob))


     //
        let imagehtml;
   
         imagehtml =Mustache.render(imagetemp,{name:message.username,imageurl:URL.createObjectURL(blob),imagetype:message.text.mimeType,createdAt:moment(message.time).format('h:mm a')});
    $viewmessages.insertAdjacentHTML('beforeend',imagehtml)
    autoscroll();

    }else{
  
    const html=Mustache.render(templet,{name:message.username,message:message.text,createdAt:moment(message.time).format('h:mm a')});
    $viewmessages.insertAdjacentHTML('beforeend',html)
    autoscroll();
    }
})

$sendbutton.addEventListener('click',()=>{
   $sendbutton.setAttribute('disabled','disabled')


if(fileStatus === true){
const fileValues={
    type:'file',
    body:file,
    mimeType:file.type,
    fileName:file.name
}
 socket.emit('message',fileValues,(error)=>{
        $sendbutton.removeAttribute('disabled')
if(error)
{
    return console.log(error)
}
       
    });
    $message.value="";
   $message.focus();
   fileStatus=false;
console.log(fileValues)
}else{

    let value=$message.value;
    
    socket.emit('message',value,(error)=>{
        $sendbutton.removeAttribute('disabled')
if(error)
{
    return console.log(error)
}
       
    })
   $message.value="";
   $message.focus();

}
});

document.getElementById('send_location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
document.getElementById('send_location').setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(message)=>{
            document.getElementById('send_location').removeAttribute('disabled')
           
        })
    })
})


socket.on('locationMessage',(message)=>{
  
const htm=Mustache.render(locationtemplet,{name:message.name,messageLocation:message.url,createdAt:moment(message.time).format('h:mm a')});
$viewmessages.insertAdjacentHTML('beforeend',htm)
autoscroll();
});

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebartemp,{
        room,users
    })
    document.getElementById('sidebar').innerHTML=html

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})



   
/*
   im.addEventListener('change',(event)=>{


console.log(event.target.files[0])
console.log(event.target.files[0].name)

   })
*/
   
