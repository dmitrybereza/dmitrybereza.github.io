var url = 'https://ar2emis.pythonanywhere.com/users'

function showModal(){
    var overlay = document.querySelector('.js-overlay-modal');
    var modalElem = document.querySelector('.modal[data-modal="1"]');
    modalElem.classList.add('active');
    overlay.classList.add('active');
}

 function  confirmUserNameFromDataBase(login){
    return new Promise((resolve, reject) =>{
        var userurl;
        userurl = url + '/' + login;
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
}

function logIn(){
    var login = $('#loginField').val();

    if(login ==''){
        Swal.fire({
            title: 'Ошибка!',
            text: 'Введите свой логин',
            icon: 'error'
          })
          return
    }

    confirmUserNameFromDataBase(login)  
    .then(() =>{
        localStorage.setItem('username', login)
        window.open('index.html','_self');
    })
    .catch(()=>{
        Swal.fire({
            title: 'Повторите попытку',
            text: 'Упс... Что-то пошло не так',
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
