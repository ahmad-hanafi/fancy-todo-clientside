// const baseURL = 'https://fancy-todo-by-ahmad-hanafi.herokuapp.com'
const baseURL = 'http://localhost:3000'
$("document").ready(function () {
    checkLocalStorage()

    $("#nav-home").on("click", (e) => {
        e.preventDefault();
        checkLocalStorage()
    })

    $("#btn-login").on("click", (e) => { // ketika button dengan tag btn-login diklik
        e.preventDefault();
        login();
    })

    $("#btn-register").on("click", (e) => {
        e.preventDefault();
        register();
    })

    $("#link-login").on("click", (e) => {
        e.preventDefault();
        pageLogin()
    })

    $("#link-register").on("click", (e) => {
        e.preventDefault();
        pageRegister()
    })

    $("#nav-add").on("click", (e) => {
        e.preventDefault();
        pageAdd()
    })

    $("#btn-add").on("click", (e) => {
        e.preventDefault();
        addTodos();
    })

    $("#btn-bored-api").on("click", (e) => {
        e.preventDefault();
        apiBored()
    })

})

function checkLocalStorage() {

    if (localStorage.access_token) {
        $("#page-login").hide();
        $("#page-register").hide();
        $("#edit-todo").hide();
        $("#add-todo").hide();
        $("#homePage").show();
        $("#navbar").show();
        $("#todos").empty()
        home()
    } else {
        pageLogin()
    }
}

function pageRegister() {
    $("#page-login").hide();
    $("#page-register").show();
    $("#edit-todo").hide();
    $("#add-todo").hide();
    $("#homePage").hide();
    $("#navbar").hide();
}

function pageLogin() {
    $("#page-login").show();
    $("#page-register").hide();
    $("#edit-todo").hide();
    $("#add-todo").hide();
    $("#homePage").hide();
    $("#navbar").hide();
}

function pageAdd() {
    $("#page-login").hide();
    $("#page-register").hide();
    $("#edit-todo").hide();
    $("#add-todo").show();
    $('#alert-date').hide()
    $("#homePage").hide();
    $("#navbar").show();
}

function pageEdit() {
    $("#page-login").hide();
    $("#page-register").hide();
    $("#edit-todo").show();
    $("#add-todo").hide();
    $("#homePage").hide();
    $("#navbar").show();
}

function register() {
    const email = $("#email-regis").val();
    const password = $("#password-regis").val();

    $.ajax({
        url: baseURL + "/register",
        method: "POST",
        data: {
            email,
            password
        }
    })
        .done((response) => {
            checkLocalStorage();
        })
        .fail((err) => {
            console.log(err);
        })
}

function login() {
    const email = $("#email").val();
    const password = $("#password").val();

    $.ajax({
        url: baseURL + "/login",
        method: "POST",
        data: {
            email,
            password
        }
    })
        .done((response) => {
            localStorage.setItem("access_token", response.access_token)
            checkLocalStorage();
        })
        .fail((err) => {
            console.log(err);
        })
        .always(() => {
            $("#email").val("")
            $("#password").val("")
        })
}

function onSignIn(googleUser) {
    $.ajax({
        method: "POST",
        url: baseURL + '/loginGoogle',
        data: {
            token: googleUser.getAuthResponse().id_token
        }
    })
        .done((response) => {
            localStorage.setItem("access_token", response.access_token)
            checkLocalStorage();
        })
        .fail((err) => {
            console.log(err);
        })
        .always(() => {
            $("#email").val("")
            $("#password").val("")
        })
}

function logout() {
    localStorage.removeItem("access_token");
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log("User signed out.");
    })
    checkLocalStorage();
}

function home() {
    $("#todos").empty()
    apiWeather()
    apiKanye()

    $.ajax({
        url: baseURL + "/todos",
        method: "GET",
        headers: {
            access_token: localStorage.access_token
        },
        success: function (res) {
            if (res.length === 0) {
                $("#todos").append(
                    `
    
                     `)
            } else if (res) {
                res.forEach(e => {
                    $("#todos").append(
                        `
                            <li class="mt-2 shadow p-3 mb-5 bg-white rounded" style="list-style-type: none">
                                <span class="text-primary">${(e.createdAt).split('T')[0]} </span>
                                <h4> ${e.title} </h4>
                                <p> ${e.description} </p>
                                <button class="btn btn-warning" disabled>Due date : ${(e.due_date).split('T')[0]}</button>
                                <button class="btn btn-info" disabled> Status : ${e.status}</button>
                                <div class="mt-2 mb-4">
                                    <button class="btn btn-success" onclick="status(${e.id})"><i class="fas fa-exchange-alt"></i> Update status</button>
                                    <button id="edit" class="btn btn-outline-primary" onclick="showEdit(${e.id})"> <i class="far fa-edit"></i>
                                        Edit</button>
                                    <button id="delete" class="btn btn-outline-danger" onclick="remove(${e.id})"> <i class="far fa-trash-alt"></i>
                                        Delete</button>
                                </div>
                            </li>
                            `
                    )
                });
            }
        },
        error: function (err) {
            console.log(err)
        }
    })

}

function status(id) {

    let status
    $.ajax({
        url: baseURL + '/todos/' + id,
        method: 'GET',
        headers: {
            access_token: localStorage.access_token
        }
    })
        .done((response) => {
            if (response.status === "Unfinished") {
                status = "Finished"
            } else {
                status = "Unfinished"
            }
            
            $.ajax({
                url: baseURL + '/todos/' + id,
                method: 'PATCH',
                headers: {
                    access_token: localStorage.access_token
                },
                data: {
                    status
                }
            })
                .done((response) => {
                    console.log(response);
                    home()
                })
                .fail((error) => {
                    console.log(error)
                })
        })

        .fail(err => {
            console.log(err);
        })
}

const remove = (id) => {
    $.ajax({
        url: baseURL + '/todos/' + id,
        method: 'DELETE',
        headers: {
            access_token: localStorage.access_token
        }
    })
        .done(data => {
            // home()
            checkLocalStorage()
        })
        .fail(err => {
            console.log(err);
        })
}

const addTodos = () => {
    
    $.ajax({
        url: baseURL + '/todos',
        method: 'POST',
        headers: {
            access_token: localStorage.access_token
        },
        data: {
            title : $('#title').val(),
            description: $('#description').val(),
            due_date: $('#due_date').val()
        }
    })
        .done(data => {
            checkLocalStorage()
        })
        .fail(err => {
            if (err.responseJSON.message === "Validation error: Date must more than today") {
                $('#alert-date').show()
            } else {
                console.log(err);
            }
        })
};

const showEdit = (id) => {
    pageEdit()
        $.ajax({
            url: baseURL + '/todos/' + id,
            method: 'GET',
            headers: {
                access_token: localStorage.access_token
            }
        })
            .done(data => {
                $('#edit-title').val(`${data.title}`)
                $('#edit-description').val(`${data.description}`)
                $('#edit-due_date').val(`${(data.due_date).split('T')[0]}`)
                $("#btn-edit").on("click", (e) => {
                    e.preventDefault()
                    editTodos(id)
                })
            })
            .fail(err => {
                console.log(err);
            })
    }

const editTodos = (id) => {
    const title = $('#edit-title').val()
    const description = $('#edit-description').val()
    const status = $('#edit-status').val()
    const due_date = $('#edit-due_date').val()

    $.ajax({
        url: baseURL + "/todos/" + id,
        method: "PUT",
        headers: {
            access_token: localStorage.access_token
        },
        data: {
            title: title,
            description: description,
            status: status,
            due_date: due_date
        }
    })
        .done(response => {
            checkLocalStorage()
        })
        .fail(err => {
            console.log(err)
        })
        .always(() => {
            checkLocalStorage()
        })
}

function apiWeather() {
    $.ajax({
        url: baseURL + "/weather",
        method: "GET",
        success: function (data) {
            $("#humidity").text(data.main.humidity + "%")
            $("#wind").text(Number(data.wind.speed).toFixed(0) + " km/h")
            $("#temp").text(Number(data.main.temp).toFixed(0) + " °")
            $("#weather").text(data.weather[0].main)
            const logo = data.weather[0].icon
            const iconUrl = "http://openweathermap.org/img/w/" + logo + ".png"
            $('#wicon').attr('src', iconUrl);
        },
        error: function (err) {
            console.log(err);
        }
    })
}

function apiKanye() {
    $.ajax({
        url: baseURL + "/kanyeQuote",
        method: "GET",
        success: function (data) {
            $('#quote-kanye').text(data)
        },
        error: function (err) {
            console.log(err);
        }
    })
}

function apiBored() {
    $.ajax({
        url: baseURL + "/boredapi",
        method: "GET",
        success: function (data) {
            $("#bored-data").text(data)
        },
        error: function (err) {
            console.log(err);
        }
    })
}