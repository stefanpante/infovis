function createTooltips(data, wrapperSVG) {
    createTip1(data, wrapperSVG);
    createTip2(data, wrapperSVG);
    createSelectedDriverTip(data, wrapperSVG);
    createTotalTip(data, wrapperSVG);
}

//function createTip()
function createTip1(data, wrapperSVG) {
    tip1 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }

            return '<div class="tooltip"><div class="name">' + data.drivers[d.ids[0].driver].name +
                '</div><div class="wins"> ' + d.ids[0].metric + ' wins </div><div class="team">' +
                d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) + '</div</div>';
        });

    wrapperSVG.call(tip1);
}

function createTip2(data, wrapperSVG) {
    tip2 = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }
            return '<div class="tooltip"><div class="name">' + data.drivers[d.ids[1].driver].name +
                '</div><div class="wins"> ' + d.ids[1].metric + ' wins </div><div class="team">' +
                d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) + '</div></div>';
        });

    wrapperSVG.call(tip2);
}

function createSelectedDriverTip(data, wrapperSVG) {
    tipSelectedDriver = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }
            return '<div class="tooltip"><div class="name"> Team ' +
                d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) +
                '</div><div class="wins"> wins <span style="color:red">' + d.wins + '</div></div>';
        });

    wrapperSVG.call(tipSelectedDriver);
}

function createTotalTip(data, wrapperSVG) {
    tipTotal = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 90])
        .html(function (d) {
            var myUpper = function (match) {
                return match.replace(/[\s_]+/, ' ').toUpperCase();
            }
            return '<div class="tooltip"><div class="name"> Team ' + d.constructorId.toUpperCase().replace(/[\s_]+\w/g, myUpper) + '</div><div class="wins"> Total wins <span style="color:red">' + d.wins + '</div></div>';
        });

    wrapperSVG.call(tipTotal);
}
