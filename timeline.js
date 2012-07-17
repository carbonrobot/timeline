// timeline
var Timeline = (function ($, window, document, undefined) {
    var self = this;
    var options = {
        id: '#timeline',
        scale: 'days', // hours, days, weeks, months
        startDate: moment().add('days', -6).format('MM/DD/YYYY'),
        selectedDate: moment().format('MM/DD/YYYY'),
        optionsChanged: function () { }
    };

    // load segments
    var loadSegments = function () {
        var startDate = moment(options.startDate);
        var duration = getDuration();
        var $container = $(options.id).find('div.center');

        // setup the timeline start and end
        var k = '<ul>';
        for (var i = 0; i < duration; i++) {
            var trackDate = moment(startDate).add(options.scale, i);
            k += '<li data-attr="' + trackDate + '"><span>' + getFormat(trackDate) + '</span></li>';
            trackDate.add(options.scale, 1);
        }
        k += '</ul>';
        $container.empty().append(k);

        // adjust css size of segments
        var $segments = $(options.id).find('div.center ul li');
        $segments.width((100 / $segments.length) + '%');

        // wire up segments
        $segments.click(function (e) {
            segmentSelected(this);
        });

        resetSelector();
    };

    // get display format
    var getFormat = function (displayDate) {
        switch (options.scale) {
            case 'hours':
                return displayDate.format('h A');
            case 'days':
                return displayDate.format('MM/DD/YYYY');
            case 'weeks':
                return 'Week ' + displayDate.format('w');
            case 'months':
                return displayDate.format('MMM');
        };
    };

    // get the duration
    var getDuration = function () {
        switch (options.scale) {
            case 'hours':
                return 12;
            case 'days':
                return 7;
            case 'weeks':
                return 5;
            case 'months':
                return 12;
        };
    };

    // adjust segment start date to fit the selected date and range
    var getSegmentStartDate = function () {
        var startDate = moment(options.startDate);
        var selectedDate = moment(options.selectedDate);
        var duration = (-getDuration() + 1);

        // adjust the start date of the timeline
        switch (options.scale) {
            case 'hours':
                // only 1 day is shown
                return selectedDate.sod();
            case 'days':
                // selectedDate is the end, start at (selected - duration)
                return selectedDate.add('days', duration);
            case 'weeks':
                return selectedDate.day(0).add('weeks', duration);
            case 'months':
                return selectedDate.date(1).sod().add('months', duration);
        };
    };

    // transforms the dates into the correct scale
    var getScaledDates = function (selectedDate) {
        var endDate = moment(selectedDate).minutes(0).seconds(0);
        var startDate = moment(endDate);

        switch (options.scale) {
            case 'hours':
                return [startDate, endDate.minutes(59).seconds(59)];
            case 'days':
                return [startDate.sod(), endDate.eod()];
            case 'weeks':
                return [startDate.day(0).sod(), endDate.day(6).eod()];
            case 'months':
                return [startDate.date(1).sod(), endDate.date(endDate.daysInMonth()).eod()];
        };
    };

    // scroll the timeline left
    var scrollLeft = function () {
        options.startDate = moment(options.startDate).add(options.scale, -1);
        loadSegments();

        selectionChanged();
    };

    // scroll the timeline right
    var scrollRight = function () {
        options.startDate = moment(options.startDate).add(options.scale, 1);
        loadSegments();

        selectionChanged();
    };

    // segment clicks change the selection
    var segmentSelected = function (segment) {
        options.selectedDate = moment(Number($(segment).attr('data-attr')));
        moveSelector(segment, selectionChanged);
    };

    // scale
    var changeScale = function (value) {
        // adjust the segment dates to match the scale
        options.scale = value;
        options.startDate = getSegmentStartDate();
        loadSegments();

        selectionChanged();
    };

    // init selector
    var initSelector = function () {
        $(options.id).find('div.selector').draggable({
            axis: 'x',
            containment: 'parent',
            snap: options.id + ' div.center ul li',
            snapTolerance: 45,
            distance: 45,
            stop: function (event, ui) {
                // http: //stackoverflow.com/questions/5177867/how-to-find-out-about-the-snapped-to-element-for-jquery-ui-draggable-elements
                var snapped = $(this).data('draggable').snapElements;
                var snappedTo = $.map(snapped, function (element) {
                    return element.snapping ? element.item : null;
                });
                console.log(snappedTo);
                // assume center element
                segmentSelected(snappedTo[1]);
            }
        }).resizable({
            containment: 'parent',
            handles: 'e, w',
            distance: 5,
            stop: function (event, ui) {
                console.log('stopped');
            }
        });
    };

    // move the selector to the selected dates
    var resetSelector = function () {
        var match = getFormat(moment(options.selectedDate));
        var segment = $(options.id).find('li:contains(' + match + ')');
        moveSelector(segment, function () {
            // nothing
        });
    };

    // move the selector to the selected segment
    var moveSelector = function (segment, callback) {
        var $segment = $(segment);
        var $span = $segment.find('span');
        var $selector = $(options.id).find('div.selector');

        // move the selector or hide if no match
        if ($segment.length > 0) {
            $selector.show();
            $selector.width($segment.width());
            $selector.resizable("option", "grid", [$segment.width(), 0]);

            // animate movement
            $selector.animate({
                left: $segment.position().left + 12
            }, 100, 'easeInCubic', function () {
                callback();
            });
        }
        else {
            $selector.hide();
        }
    };

    // options changed handler
    var selectionChanged = function () {
        console.log('timeline start: ' + options.startDate.toString());
        options.selectionChanged(getScaledDates(options.selectedDate));
    };

    return {

        init: function (opt) {
            // extend default options
            options = $.extend({}, options, opt);

            // wire up left and right arrow
            $(options.id).find('div.leftarrow').click(function (e) {
                scrollLeft();
            });
            $(options.id).find('div.rightarrow').click(function (e) {
                scrollRight();
            });

            // wire up selector and set its initial position
            initSelector();

            // load the segments
            loadSegments();

            // watch window resizing
            $(window).resize(loadSegments);
        },

        getSelectedDates: getScaledDates,

        getScale: function () {
            return options.scale;
        },

        setScale: function (value) {
            changeScale(value);
        }

    };

})(jQuery, window, this);