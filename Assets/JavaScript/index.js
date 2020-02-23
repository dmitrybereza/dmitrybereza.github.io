var url = 'https://ar2emis.pythonanywhere.com'

function showModal(){
    var overlay = document.querySelector('.js-overlay-modal');
    var modalElem = document.querySelector('.modal[data-modal="1"]');
    modalElem.classList.add('active');
    overlay.classList.add('active');
}

 function  confirmUserNameFromDataBase(login){
    return new Promise((resolve, reject) =>{
        var userurl;
        userurl = url + '/users/' + login;
        sendRequest('GET',userurl)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
}

function sendRequest(method, url, body = null){
    return new Promise((resolve, reject) =>{
        var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
        var xhr = new XHR();
        $(".loader_inner").css('opacity','1')
        $(".loader_inner").fadeIn();
        $(".loader").delay(400).fadeIn("slow");
        xhr.open(method, url, true);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.onload = () =>{
            if(xhr.status >=400){
                $(".loader_inner").fadeOut();
                $(".loader").delay(400).fadeOut("slow");
                reject(xhr.response)
            }else{   
                $(".loader_inner").fadeOut();
                $(".loader").delay(400).fadeOut("slow");    
                resolve(xhr.response)
            }
        }
        xhr.onerror = () =>{
            $(".loader_inner").fadeOut();
            $(".loader").delay(400).fadeOut("slow");
            reject(xhr.response)
        }

        xhr.send(JSON.stringify(body));
    })
}


function init(){
  
    $(".loader_inner").fadeOut();
    $(".loader").fadeOut();
    if(!localStorage.getItem('username')){
        showModal();
        
    }
    else{
        loadWorker()
        loadContent()
    }
}

function loadWorker(){
    user = JSON.parse(localStorage.getItem('user'));
    $('p.workerName').html(user.name)
    sendRequest('GET',user.role)
    .then(data => {
        $('p.workerRole').html(data.name)
        localStorage.setItem('roleName', data.name)
        if(data.name == 'Менеджер'){
            localStorage.setItem('isManager', 'true')
        }
    })
    .catch(err => reject(err))
}

function setStatus(login){
    return new Promise((resolve, reject) =>{
        var userurl;
        userurl = url + '/users/' + login;

        var body ={
            'active' : true
        }

        sendRequest('PATCH',userurl, body)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
}

function logIn(){
    var login = $('#loginField').val();

    if(login ==''){
        Swal.fire({
            title: 'Введите логин!',
            icon: 'error',
            timer: '1000',
            showConfirmButton: false
          })
          return
    }

    confirmUserNameFromDataBase(login)  
    .then(data =>{
        console.log(data.active)
        if(data.active == true){
            Swal.fire({
                title: 'Пользователь уже в сети!',
                icon: 'error',
                timer: '1000',
                showConfirmButton: false
              })   
              $('#loginField').val('');
              return
        }
        localStorage.setItem('username', login)
        setStatus(login)
        .then((data) => {
            localStorage.setItem('user', JSON.stringify(data))
            window.open('index.html','_self');
            loadWorker()
        })
        .catch(() => {})
    })
    .catch(()=>{
        Swal.fire({
            title: 'Неверный логин!',
            icon: 'error',
            timer: '1000',
            showConfirmButton: false
          })
          $('#loginField').val('');
    });
}

function setOfflineStatus(login){
    return new Promise((resolve, reject) =>{
        var userurl;
        userurl = url + '/users/' + login;

        var body ={
            'active' : false
        }

        sendRequest('PATCH',userurl, body)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
}
    
function logOut(){
    var login = localStorage.getItem('username')
    setOfflineStatus(login)
    .then(() => {
        localStorage.clear();
        window.open('index.html','_self');
    })
    .catch(() => {})
}


function loadWatch(watchName){
    return new Promise((resolve, reject) =>{
        var userurl;
        userurl = url + '/watches?date=' + watchName
        sendRequest('GET',userurl)
        .then(data => resolve(data))
        .catch(err => reject(err))
    })
}

function taskIsDone(url){
    var body ={
        'worker': JSON.parse(localStorage.getItem('user')).url,
        'progress' : 'https://ar2emis.pythonanywhere.com/progress/done/'
    }
    sendRequest('PATCH',url, body)
    .then(()=>{
        loadContent() 
    }) 
}

function showTaskPhoto(url){
    sendRequest("GET", url)
    .then(data => { 
        var img =''
        img += '<img src="data:image/gif;base64,' + data.image + '">';
        $('.taskCheck').html(img)
    })
}

  function encodeImageFileAsURL() {

    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];

      var fileReader = new FileReader();

      fileReader.onload = function(fileLoadedEvent) {
        var srcData = fileLoadedEvent.target.result;

        var newImage = document.createElement('img');
        newImage.src = srcData;

        var src = newImage.src
        src = src.replace('data:image/jpeg;base64,', '')
        console.log(src)
      }
      fileReader.readAsDataURL(fileToLoad);
    }
  }

function showTask(task){
    out = ''
        if(localStorage.getItem('isManager') == 'true'){
            out+='<div class taskType>'
        out+='<p>'+task.work_type.name+'</p>'
        out+='</div>'
    }
    out+='<div class="task">'
    out+='<div class taskName>'
    out+='<p>'+task.name+'</p>'
    out+='</div>'
    out+='<div class taskText>'
    out+='<p>'+task.text+'</p>'
    out+='</div>'
    if(task.progress.name == 'To do'){
        out+='<div class="taskCheck">'
        out+='<input onclick="taskIsDone(\'' + task.url + '\')" type="checkbox">'
        out+='</div>'
        out+='<div class taskImg>'
        out+='<input id="inputFileToLoad" type="file" onchange="encodeImageFileAsURL(\'' + task.url + '\');"/>'
        out+='</div>'
    }
    else if(task.progress.name == 'In Progress'){
        out+='<div class="taskCheck">'
        out+='<p class="taskProgressProgress">Выполняется...</p>'
        out+='</div>'
    }
    else{
        if(localStorage.getItem('isManager') == 'true'){
            out+='<div class="taskCheck">'
            out+='<p class="taskProgressDone">Сделано '+task.worker.name+'</p>'
            out+='</div>'
            out+='<div class="taskImg">'
            out+='<button onclick="showTaskPhoto(\'' + task.url + '\')">Показать</button>'
            out+='</div>'
        }
        else{
            out+='<div class="taskCheck">'
            out+='<p class="taskProgressDone">Сделано</p>'
            out+='</div>'
        }
    }
    out+='<div class="horizontalLine">'
        out+='<hr>'
        out+='</div>'
    out+='</div>'
    return out
}

function dateCalculate(direction){
    var url = JSON.parse(localStorage.getItem('watch')).url
    var number = url.substr(43)
    number = number.replace('/', '')
    url = url.substr(0, 43)
    if(direction == 'back'){
        if(number != 1){
            number--
        }
    }
    else{
        number++
    }
    url = url + number
    return url
}

function previousDate(){
    sendRequest('GET',dateCalculate('back'))
        .then(data => {
            loadTasks(data)
            loadDate(data)
            localStorage.setItem('watch', JSON.stringify(data))

        })
        .catch(err => reject(err))
}

function nextDate(){
    sendRequest('GET',dateCalculate('next'))
        .then(data => {
            loadTasks(data)
            loadDate(data)
            localStorage.setItem('watch', JSON.stringify(data))
        })
        .catch(err => reject(err))
}

function loadDate(watch){
    out = ''
    if(localStorage.getItem('roleName') == 'Менеджер'){
        out +='<div onclick="previousDate()" class="leftArrow">'
        out+='<i class="fas fa-chevron-left"></i>'
        out+='</div>'
        out+='<div class="Date">'
        out+='<p class="dateP">'+watch.date+'</p>'
        out+='<p class="dateP">'+watch.watch_type.name+'</p>'
        out+='</div>'
        out+='<div onclick="nextDate()" class="rightArrow">'
        out+='<i class="fas fa-chevron-right"></i>'
        out+='</div>'
    }
    else{
        out+='<div class="Date">'
        out+='<p>'+watch.date+'</p>'
        out+='<p class="dateP">'+watch.watch_type.name+'</p>'
        out+='</div>'
    }
    $('.dateDiv').html(out) 
}

function loadTasks(watch){
    loadDate(watch)
    var user = localStorage.getItem('user')
    var out = ''
    for(var id in watch.tasks){
        if(localStorage.getItem('isManager') == 'true'){
            out += showTask(watch.tasks[id])
        }
        else{
            if(watch.tasks[id].work_type.name == localStorage.getItem('roleName')){
                out += showTask(watch.tasks[id])
            }
        }
        
    }
    $('.watchTasks').html(out)   
}

function loadContent(){
    
    var dateMonth = date.getMonth() + 1
    var dateDay = date.getDate()
    var type = 'День'

    if(dateDay < 10){
        dateDay = '0' + dateDay
    }

    if(dateMonth < 10){
        dateMonth = '0'+ dateMonth
    }

    var watchName = date.getFullYear() + '-' + dateMonth + '-' + dateDay

    localStorage.setItem('date', watchName)

    var watch = {}
    loadWatch(watchName)
    
    .then(data => {
        if(date.getHours() > 12){
            type = 'Ночь'
        }

        for(var temp in data){
            if(data[temp].watch_type.name == type){
                watch = data[temp]
            }
        }

        localStorage.setItem('watch', JSON.stringify(watch))

        loadTasks(watch)
    })
    .catch(err => console.log(err, err.status))
}
