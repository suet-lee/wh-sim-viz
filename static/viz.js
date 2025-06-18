$(document).ready(function() {

    G_CTRL = $('input[name=controller]').val()
    G_DATA = {}
    G_METADATA = {'iterations':10000}
    G_VIZ = {'draw_axes':false}

    $('#btns #reload').prop('disabled', true)
    $('#btns #play').prop('disabled', true)
    $('#btns .step').prop('disabled', true)
    $('#btns #pause').prop('disabled', true)

// ############################ Draw the arena axes

// @TODO make general for width/height of arena

    function drawAxes() {
        // Add axis labels to arena
        yaxis = $('#yaxis')
        xaxis = $('#xaxis')
        cpos = $('#arena').offset()
        
        if (canvasWidth == 500 && canvasHeight == 500 || canvasWidth == undefined && canvasHeight == undefined) {
            yaxis.offset({'left': cpos.left-yaxis.width(), 'top': cpos.top-5})
            xaxis.offset({'left': cpos.left-5, 'top': cpos.top+504})
        } else {
            yaxis.offset({'left': cpos.left-yaxis.width(), 'top': cpos.top-5})
            xaxis.offset({'left': cpos.left-5, 'top': cpos.top+canvasHeight+4})
        }

        var ycanv = document.querySelector("#yaxis")
        var yctx = ycanv.getContext("2d")
        
        if (canvasHeight !== undefined && canvasHeight != 500) {
            yh = ycanv.height = canvasHeight+13
            $("#yaxis").height(yh+"px")
            ticks = [6,canvasHeight/2+6,canvasHeight+8]
            text = [canvasHeight,canvasHeight/2]
        }
        else {
            yh = ycanv.height = 513
            ticks = [6,106,206,306,406,508]
            text = [500,400,300,200,100]
        }

        yw = ycanv.width = 100
        t0 = yw-10
        t1 = yw
        text_pos = t0-30
        $.each(ticks, function( index, tick ){
            yctx.beginPath()
            yctx.lineWidth = 2
            yctx.strokeStyle = '#2b2b2b'
            yctx.moveTo(t0, tick)
            yctx.lineTo(t1,tick)
            yctx.stroke()
            if (index < ticks.length - 1) {
                yctx.font = "14px Helvetica bold";
                yctx.fillStyle = '#2b2b2b';
                yctx.fillText(text[index], text_pos, tick+5);
            }
            yctx.closePath()
        })

        if (canvasHeight !== undefined && canvasHeight != 500) {
            yctx.fillText(0, text_pos+15, canvasHeight+12);
        }
        else {
            yctx.fillText(0, text_pos+15, 512);
        }        

        var xcanv = document.querySelector("#xaxis")
        var xctx = xcanv.getContext("2d")
        xh = xcanv.height = 100

        if (canvasWidth !== undefined && canvasWidth != 500) {
            xw = xcanv.width = canvasWidth+20
            $("#xaxis").width(xw+"px")
            ticks = [6,canvasHeight/2+6,canvasHeight+8]
            text = [0,canvasHeight/2,canvasHeight]
        }
        else {
            xw = xcanv.width = 520
            ticks = [6,106,206,306,406,508]
            text = [0,100,200,300,400,500]
        }
        
        t0 = 0
        t1 = 10
        text_pos = t0+26
        $.each(ticks, function( index, tick ){
            xctx.beginPath()
            xctx.lineWidth = 2
            xctx.strokeStyle = '#2b2b2b'
            xctx.moveTo(tick, t0)
            xctx.lineTo(tick, t1)
            xctx.stroke()
            if (index > 0) {
                xctx.font = "14px Helvetica bold";
                xctx.fillStyle = '#2b2b2b';
                xctx.fillText(text[index], tick-14, text_pos);
            }
            xctx.closePath()
        })    
        xctx.fillText(0, 2, text_pos);

        if (canvasWidth == 500 && canvasHeight == 500 || canvasWidth == undefined && canvasHeight == undefined) {
            $('#height_lab').show()
            $('#width_lab').show()
            $('#height_lab').offset({
                'top': yaxis.offset().top+180, 'left': yaxis.offset().left+20})
            $('#width_lab').offset({
                'top': xaxis.offset().top+50, 'left': xaxis.offset().left+180})
        } else {
            $('#height_lab').hide()
            $('#width_lab').hide()
        }
    }

    // First init of axes (without data)
    if (G_VIZ['draw_axes'])
    {
        drawAxes()
    }
    else
    {
        $('#height_lab').hide()
        $('#width_lab').hide()
    }

// ############################ Canvas variables

    var canvas = document.querySelector("#arena")   // Get access to HTML canvas element
    var ctx = canvas.getContext("2d")
    var canvasWidth = canvas.width = 370//500//$('input[name=arena_w]').val()
    var canvasHeight = canvas.height = 370//500//$('input[name=arena_h]').val()

    canvasData = {
        'robot_r': 12.5,// @TODO remove hardcoded object size
        'box_r': 12.5,
        'box_m_r': 35.0,
        'deposit_zones': [],//$('input[name=deposit_zones]').val(),
        'timestep': 1
    }

// ############################ Get data and populate variables

    function getData()
    {
        el = $('#get-data-btn')
        el.prop('disabled', true)
        // $('#runEx').prop('disabled', true)
        $.ajax({
            url: '/get-data/' + G_CTRL,
            method: 'GET',
            success: function (data) {
                console.log("Success: fetch data")
                data = JSON.parse(data)
                $.each(data, function(key, val) {
                    if (key == "metadata")
                    {
                        G_METADATA = val[0]
                    }
                    else if (key == "metrics")
                    {
                        G_DATA["predf"] = val
                        console.log(val)
                    }
                    else G_DATA[key] = val
                });
                
                if ('iterations' in G_METADATA)
                {
                    $("input[name='ts-slider']").prop("max", G_METADATA['iterations']);
                }
                if ("deposit_zones" in G_METADATA)
                {
                    canvasData['deposit_zones'] = G_METADATA["deposit_zones"]
                }
                if ("arena_width" in G_METADATA)
                {
                    canvasData["arena_width"] = G_METADATA["arena_width"]
                    canvasWidth = canvas.width = canvasData["arena_width"]
                    $("#arena").width(canvasWidth+"px")
                }
                if ("arena_height" in G_METADATA)
                {
                    canvasData["arena_height"] = G_METADATA["arena_height"]
                    canvasHeight = canvas.height = canvasData["arena_height"]
                    $("#arena").height(canvasHeight+"px")
                }
                if ("number_of_agents" in G_METADATA)
                {
                    canvasData["number_of_agents"] = parseInt(G_METADATA["number_of_agents"])
                }
                if ("number_of_boxes" in G_METADATA)
                {
                    canvasData["number_of_boxes"] = parseInt(G_METADATA["number_of_boxes"])
                }
                if ("number_of_boxes_m" in G_METADATA)
                {
                    canvasData["number_of_boxes_m"] = parseInt(G_METADATA["number_of_boxes_m"])
                }
                if ("number_of_faults" in G_METADATA)
                {
                    canvasData["number_of_faults"] = parseInt(G_METADATA["number_of_faults"])
                }
            },
            error: function (error) {
                console.log("Error: fetch data")
            },
            complete: function () {
                el.prop('disabled', false)
                // $('#runEx').prop('disabled', false)
                $('#btns #reload').prop('disabled', false)
                $('#btns #play').prop('disabled', false)
                $('#btns .step').prop('disabled', false)
                $('#btns #pause').prop('disabled', false)
                if (G_VIZ['draw_axes'])
                {
                    drawAxes()
                }
                else
                {
                    $('#height_lab').hide()
                    $('#width_lab').hide()
                }
            }
        });   
    }

    $('#get-data-btn').on('click', getData)

// ############################ Visualize functions
    
    function drawZone(zone) {
        c0 = zone[0]
        w = zone[1]
        h = zone[2]
        ctx.beginPath()
        ctx.fillStyle = '#549154'
        ctx.fillRect(c0[0], canvasHeight-c0[1]-h, w, h);
        ctx.closePath()
    }

    function drawDepositZones()
    {
        zones = canvasData['deposit_zones']
        $.each(zones, function(idx, zone){
            drawZone(zone)
        });
    }

    function drawRobot(id, x, y, is_faulty=false) {
        r = Number(canvasData['robot_r'])
        ctx.beginPath()
        // ctx.fillStyle = '#6f777d'
        ctx.setLineDash([])
        
        ctx.lineWidth = 2
        ctx.strokeStyle = '#1f1f1f'
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        
        // Fill colour faulty robots
        if (is_faulty){ 
            // drawPentagon(x,y,r,ctx)
            // ctx.font = "20px Arial";
            ctx.fillStyle = 'red';
            ctx.fill()
            // ctx.fillText("*", x-5, y+8);
        }

        label = "r"+id
        ctx.stroke()
        
        // Robot ID label shifts according to proximity to wall
        if (x > canvasWidth-r-19) {
            t0 = x-r-10
        } else {
            t0 = x+r+1
        }
        if (y > canvasHeight-r-10) {
            t1 = y-r-4
        } else {
            t1 = y+r
        }
        
        // Draw robot ID
        ctx.font = "10px Arial";
        ctx.fillStyle = '#1f1f1f';
        ctx.fillText(label, t0, t1);

        // drawHeading(i-1,x,y,r)

        ctx.closePath()
    }

    function drawBox(x, y) {
        r = canvasData['box_r'] * 1.3 // Scale factor*Radius less than the true diameter (2*r)
        ctx.beginPath()
        ctx.fillStyle = 'blue'
        c1 = x - r/2
        c2 = y - r/2
        ctx.fillRect(c1,c2,r,r);
        ctx.fill()
        ctx.closePath()
    }

    function drawBoxM(id, x, y) {
        r = canvasData['box_m_r'] * 2.0
        ctx.beginPath()
        ctx.lineWidth = 3
        ctx.strokeStyle = 'orange'
        c1 = x - r/2
        c2 = y - r/2
        ctx.rect(c1,c2,r,r);
        ctx.stroke();

        // Draw robot ID
        ctx.font = "13px Arial";
        ctx.fillStyle = 'orange';
        ctx.fillText(id, x, y);

        // ctx.fillRect(c1,c2,r,r);
        // ctx.fill()
        ctx.closePath()
    }

    function drawDTag(x, y, tag) {
        ctx.beginPath()
        ctx.font = "10px Arial";
        ctx.fillStyle = '#1f1f1f';
        ctx.fillText(tag, x, y);
        ctx.closePath()
    }

    function drawHeading(x,y,heading,r,color='#65bf65') {
        unit_y = -Math.sin(heading) // -sin(-heading)
        unit_x = Math.cos(heading) // -cos(-heading)
        start = [x+(r+0.1)*unit_x, y+(r+0.1)*unit_y]
        length = r*1.7
        end = [x+length*unit_x, y+length*unit_y]
        ctx.beginPath()
        ctx.lineWidth = 2
        ctx.strokeStyle = color
        ctx.moveTo(start[0], start[1])
        ctx.lineTo(end[0], end[1])
        ctx.stroke()
        ctx.closePath()
    }

    // Function clears the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function fetchGdata(key, ts) {
        data = undefined
        if (key in G_DATA)
        {
            data = G_DATA[key][ts]
        }
        if (data == undefined)
        {
            data = []
        }
        return data
    }

    function drawRates(ts) {
        rs = G_DATA['rates']
        s = rs[0][ts]
        sa = rs[1][ts]
        p = rs[2][ts]
        pa = rs[3][ts]
        d = rs[4][ts]
        da = rs[5][ts]

        $("#rates-txt").html("S "+s+" / SA "+sa+" / P "+p+" / PA "+pa+" / D "+d+" / DA "+da)
    }

    function drawFrame() {
        clearCanvas()
        drawDepositZones()
        ts = canvasData['timestep']

        // d = redisData[ts]
        // ap = adPred[ts]
        rob_c = fetchGdata('robots',ts)
        box_c = fetchGdata('boxes',ts)
        box_m_c = fetchGdata('boxes_m',ts)
        dtags = fetchGdata('dtags',ts)
        headings = fetchGdata('heading',ts)
        c_headings = fetchGdata('c_heading',ts)
        // pred = 

        // cam_r = JSON.parse(d['camera_range'])
        // faults = metaData['fault_count'][0]

        $('#time_txt').html(Number(ts/50-0.02).toFixed(2))

        // try {
        //     drawRates(ts)
        // }
        // catch {
        //     //
        // }
        

        i = 0
        // for (const c of rob_c) {
        //     r = cam_r[i]
        //     drawCamSensor(c[0], 500-c[1], r)
        //     i++
        // }

        i = 1
        for (const c of rob_c) {
            if (i <= canvasData['number_of_faults'] 
                || ("fault_p" in G_DATA && ts in G_DATA["fault_p"] && G_DATA["fault_p"][ts][i-1] == 1)) {
                is_faulty = true
            }
            else {
                is_faulty = false
            }

            // is_faulty=false
            drawRobot(i, c[0], canvasWidth-c[1], is_faulty, ts)
            
            try {
                tag = dtags[i]
                drawDTag(c[0], canvasWidth-c[1], parseInt(tag[0]))
            }
            catch {
                //
            }

            try {
                h = headings[i-1]
                drawHeading(c[0], canvasWidth-c[1], h, 12.5)
            }
            catch {
                //
            }
            
            // if (ap != null && ap[i-1]) { // @TODO clear ap data
            //     drawFault(c[0], canvasWidth-c[1])
            // }
            i++
        }

        for (const c of box_c) {
            drawBox(c[0], canvasWidth-c[1])
        }

        i = 1;
        for (const c of box_m_c) {
            drawBoxM(i, c[0], canvasWidth-c[1])

            try {
                h = c_headings[i-1]
                if (h != 99)
                {
                    drawHeading(c[0], canvasWidth-c[1], h, 30, 'orange')
                }
            }
            catch {
                //
            }

            i++
        }
    }

    $('#btns #reload').on('click', function(){
        canvasData['timestep'] = 1
        drawFrame()
    });

    $('#btns .step').on('click', function(){
        step = Number($(this).data('step'))
        canvasData['timestep'] += step
        if (canvasData['timestep'] >= G_METADATA['iterations']) {
            canvasData['timestep'] = G_METADATA['iterations']
        }
        if (canvasData['timestep'] < 0) {
            canvasData['timestep'] = 0
        }
        drawFrame()
        // populateMetrics()
    });

    paused = false
    $('#btns #pause').on('click', function(){
        paused = true
    });

    // var input_ts = -1
    // $("input[name='ts-slider']").on('input change', function()
    // {
    //     ts = $("input[name='ts-slider']").val()
    //     input_ts = ts
    // });

    running = false
    $('#btns #play').on('click', function(){
        if (running) {
            if (paused) {
                paused = false
            }
            return
        }
        interval = window.setInterval(function(){
            running = true
            if (paused) {
                return
            }
            
            // if (input_ts > 0)
            // {
            //     canvasData['timestep'] = input_ts
            //     input_ts = -1
            // } 
            // else
            // {
            //     canvasData['timestep'] += 1
            //     $("input[name='ts-slider']").val(canvasData['timestep']);
            //     $("input[name='ts-text'").val(canvasData['timestep']);
            // }
                
            canvasData['timestep'] += 1
            if (canvasData['timestep'] >= G_METADATA['iterations']) {
                clearInterval(interval)
            }
            
            drawFrame()
            
            // populateMetrics()
        }, 5);//50);        
    })

    // Displays metric data for current timestep and selected metric
    // function populateMetrics() {
    //     t = canvasData['timestep']
    //     data = metricData[t]
    //     // metric = metaData['metrics']
    //     ag_id = Number($('.metrics select').val())
    //     showMetricData(data, ag_id)
    // }

    // function showMetricData(data, ag_id) {
    //     html = ''
    //     for (const [metric, arr] of Object.entries(data)) {
    //         data_ = JSON.parse(arr.replaceAll('NaN', 'null'))
    //         value = data_[ag_id]
    //         html += '<p>'+metric+': <span class="val">'+value+'</span></p>'
    //     }

    //     $('#metricData').html(html)
    // }
});