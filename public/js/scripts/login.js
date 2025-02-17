const form = document.querySelector('form');
const validate_error=document.querySelector('.validate_error');

form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const username=form.username.value;
    const password=form.password.value;
    const csrfToken=form._csrf.value;
    try{
        const res_message=await fetch('/user/login',{
            method:'POST',
            body: JSON.stringify({username:username, password:password,_csrf:csrfToken}),
            headers:{'Content-Type':'application/json'}
        });
        const data=await res_message.json();
        if (data.error){
            validate_error.innerHTML=data.error;
        }else{
            alert('Login successfully');
            window.location.assign('/case/view');
        }

       
    }catch(err){
        console.log(err);
        alert(`Something goes wrong, please contact system admin.`);
            
    }
})
