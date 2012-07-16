// timeline
var Timeline = (function ($, window, document, undefined) {
    var self = this;
    var options = {
        id: '#timeline',
        scale: 'weeks', // hours, days, weeks, months
        startDate: moment().add('days', -6).format('MM/DD/YYYY'),
        endDate: moment().format('MM/DD/YYYY'),
        selectedDates: [moment().format('MM/DD/YYYY'), moment().format('MM/DD/YYYY')],
        optionsChanged: function () { }
    };

    // load segments
    var loadSegments = function () {
        var endDate = moment(options.endDate);
        var trackDate = moment(options.endDate).add(options.scale, (-getDuration() + 1));
        var k = '<ul>';
        while (endDate.diff(trackDate, options.scale) >= 0) {
            k += '<li>' + getFormat(trackDate) + '</li>';
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

    // scroll the timeline left
    var scrollLeft = function () {
        options.startDate = moment(options.startDate).add(options.scale, -1)
        options.endDate = moment(options.endDate).add(options.scale, -1)
        loadSegments();

        _optionsChanged();
    };

    // scroll the timeline right
    var scrollRight = function () {
        options.startDate = moment(options.startDate).add(options.scale, 1)
        options.endDate = moment(options.endDate).add(options.scale, 1)
        loadSegments();

        _optionsChanged();
    };

    // segment clicks change the selection
    var segmentSelected = function (segment) {
        var selectedDate = moment($(segment).text());
        options.selectedDates = [selectedDate, selectedDate];
        _moveSelector(segment, _optionsChanged);
    };

    // scale
    var changeScale = function (value) {
        options.scale = value;

        // modify the start and end dates
        switch (options.scale) {
            case 'hours':
                options.selectedDates = options.selectedDates;
            case 'days':
                options.selectedDates = options.selectedDates;
            case 'weeks':
                options.selectedDates = options.selectedDates;
            case 'months':
                options.selectedDates = options.selectedDates;
        };

        // reload ui
        loadSegments();
    };

    // move the selector to the selected dates
    var _resetSelector = function () {
        var match = getFormat(moment(options.selectedDates[0]));
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

    var selectorClicked = function () {
        console.log('selector clicked');
    };

    // options changed handler
    var _optionsChanged = function () {

        options.optionsChanged();
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

            // load the segments
            loadSegments();

            // wire up selector and set its initial position
            $(options.id).find('div.selector').click(function (e) {
                selectorClicked();
            });

        },

        getSelectedDates: function () {
            return options.selectedDates;
        },

        setSelectedDates: function (value) {
            options.selectedDates = value;
            loadSegments();
        },

        getScale: function () {
            return options.scale;
        },

        setScale: function (value) {
            changeScale(value);
        }

    };

})(jQuery, window, this);