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
        var sdfasf;
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

        xhr.send();
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
    $('p.workerRole').html(user.role.name)
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
        localStorage.setItem('username', login)
        localStorage.setItem('user', JSON.stringify(data))
        window.open('index.html','_self');
        loadWorker()
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
    
function logOut(){
    localStorage.clear();
    window.open('index.html','_self');
}
