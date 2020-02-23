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
    }
}

function loadWorker(){
    user = JSON.parse(localStorage.getItem('user'));
    $('p.workerName').html(user.name)
    sendRequest('GET',user.role)
    .then(data => {
        $('p.workerRole').html(data.name)
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
    .catch(() => console.log('tut'))
}
