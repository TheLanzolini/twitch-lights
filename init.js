

hue.registerUser(host, userDescription)
    .then(displayUserResult)
    .fail(displayError)
    .done();


    hue.deleteUser("2b997aae306f15a734d8d1c2315d47cb")
        .then(displayUserResult)
        .fail(displayError)
        .done();
