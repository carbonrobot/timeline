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
        // setup the timeline start and end
        var startDate = moment(options.startDate);
        var duration = getDuration();

        var k = '<ul>';
        for (var i = 0; i < duration; i++) {
            var trackDate = moment(startDate).add(options.scale, i);
            k += '<li data-attr="' + trackDate + '">' + getFormat(trackDate) + '</li>';
            trackDate.add(options.scale, 1);
        }
        k += '</ul>';
        $(options.id).find('div.center').empty().append(k);

        // adjust css size of segments
        var $segments = $(options.id).find('div.center ul li');
        $segments.width((100 / $segments.length) + '%');

        // wire up segments
        $segments.click(function (e) {
            segmentSelected(this);
        });

        _resetSelector();
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

    // transforms the dates into the correct scale
    var getScaledDates = function (selectedDate) {
        var endDate = moment(selectedDate).minutes(0).seconds(0);
        var startDate = moment(endDate);

        switch (options.scale) {
            case 'hours':
                return [startDate, endDate];
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

        _selectionChanged();
    };

    // scroll the timeline right
    var scrollRight = function () {
        options.startDate = moment(options.startDate).add(options.scale, 1);
        loadSegments();

        _selectionChanged();
    };

    // segment clicks change the selection
    var segmentSelected = function (segment) {
        options.selectedDate = moment(Number($(segment).attr('data-attr')));

        _moveSelector(segment, _selectionChanged);
    };

    // scale
    var changeScale = function (value) {
        options.scale = value;

        //options.selectedDates = getScaledDates();

        // reload ui
        loadSegments();
    };

    // init selector
    var _initSelector = function () {
        $(options.id).find('div.selector').draggable({
            axis: 'x',
            containment: 'parent',
            snap: options.id + ' div.center ul li',
            snapTolerance: 45,
            distance: 45,
            stop: selectorChanged
        });
    };

    // move the selector to the selected dates
    var _resetSelector = function () {
        var match = getFormat(moment(options.selectedDate));
        var segment = $(options.id).find('li:contains(' + match + ')');
        _moveSelector(segment, function () {
            // nothing
        });
    };

    // move the selector to the selected segment
    var _moveSelector = function (segment, callback) {
        $segment = $(segment);
        $selector = $(options.id).find('div.selector');

        // move the selector or hide if no match
        if ($segment.length > 0) {
            $selector.show();
            $selector.width($segment.width());

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

    var selectorChanged = function () {
        // TODO: determine what it stopped over and set the dates
        _selectionChanged();
    };

    // options changed handler
    var _selectionChanged = function () {

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
            _initSelector();

            // load the segments
            loadSegments();
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