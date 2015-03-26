
function createTimeLineNav(data) {
    //console.log(JSON.stringify(data));
    // select the timeline navigation.
    var time_line_nav = d3.select("#timelineNav");
    var selector = $("#selector");

    // get the total number of years to display
    var numberOfYears = data.length;
    // Calculate the totalwidth of the timeline
    var totalWidth = numberOfYears * 500;

    // calculate the width of each year in the navigation in percentages 
    var relativeWidth = 100 / numberOfYears;

    // Draggable timeline displaying the years
    var years = time_line_nav.selectAll(".year")
        .data(data).enter()
        .append("div")
        .attr('class', 'year')
        .text(function (d) {
            return d.Year;
        })
        .attr("style", "width:" + relativeWidth + "%");

    // calculate the width that the selector has so that it corresponds to the displayed years
    var width = $("#timelineNav").width();
    var selectorWidth = parseInt($("#timelineNav").outerWidth()) * parseInt($("#timeline").outerWidth()) / totalWidth;
    selector.css({
        width: selectorWidth + "px"
    })

    // make the navigation selector draggable
    $("#selector").draggable({
        axis: 'x',
        containment: "parent",
        drag: function (event) {
            var position = $(event.target).position();
            var left = position.left;
            if (position.left < 0) {
                left = 0;
                $("#selector").css({
                    "left": left
                });
            }
            if (position.left + selectorWidth > width) {
                left = width - selectorWidth;
                $("#selector").css({
                    "left": left
                });
            }
            var factor = left / width;
            var offset = -factor * totalWidth;

            $("#wrap_timeline").css({
                "left": offset + "px"
            });

            $("#wrapperSVG").css({
                "left": offset + "px"
            });
        }

    });

    $("#timelineNav .year").click(function (event) {
        var left = $(event.target).position().left;

        var factor = left / width;
        var offset = -factor * totalWidth;

        $("#selector").css({
            left: left + "px"
        });

        $("#wrap_timeline").css({
            "left": offset + "px"
        });

        $("#wrapperSVG").css({
            "left": offset + "px"
        });
    });

    $("#wrap_timeline").draggable({
        axis: 'x',

        drag: function (event) {
            var left = parseInt($(event.target).position().left);

            $("#wrapperSVG").css({
                left: left + "px"
            });
            var factor = -left / totalWidth;
            console.log("factor: " + factor);
            var left1 = width * factor;

            $("#selector").css({
                left: left1
            })
        },

        end: function (event) {
            var left = parseInt($(event.target).position().left);

            $("#wrapperSVG").css({
                left: left + "px"
            });
            var factor = -left / totalWidth;
            console.log("factor: " + factor);
            var left1 = width * factor;
            console.log(left1);
            $("#selector").css({
                left: left1
            })
        }
    });


}
