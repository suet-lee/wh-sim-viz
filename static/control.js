$(document).ready(function() {

    G_CTRL = $('input[name=controller]').val()

    $('#btns #reload').prop('disabled', true)
    $('#btns #play').prop('disabled', true)
    $('#btns .step').prop('disabled', true)
    $('#btns #pause').prop('disabled', true)

// ############################ Get data and populate variables

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    function getRandomInt(min=-1000000, max=1000000) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function runSim()
    {
        el = $('#run-sim-btn')
        el.prop('disabled', true)
        $('#get-data-btn').prop('disabled', true)
        $('#btns #pause').click()
        $('#btns #reload').prop('disabled', true)
        $('#btns #play').prop('disabled', true)
        $('#btns .step').prop('disabled', true)
        $('#btns #pause').prop('disabled', true)
        
        $('#loading').show()
        interval = window.setInterval(function(){
            width = $('#loading #panel #loading-visual').width*1.1
            $('#loading #panel #loading-visual').width(width);
            $('#loading #panel #loading-visual').height(width);
        }, 50);  
    
        data = $('#sim-cfg').serialize()
        seed = $('#dummy-seed').val()
        if (seed == "-1")
        {
            seed = getRandomInt()
        }
        data += "&s=" + seed

        $.ajax({
            url: '/run-sim/' + G_CTRL,
            method: 'POST',
            data: data,
            success: function (data) {
                clearInterval(interval)
                $('#loading').hide()
                console.log("Success: run sim")
            },
            error: function (error) {
                console.log("Error: run sim")
            },
            complete: function () {
                el.prop('disabled', false)
                $('#get-data-btn').prop('disabled', false)
                $('#get-data-btn').click()
                $('#reload').click()
            }
        });   
    }
    
    $('#run-sim-btn').on('click', runSim)

});