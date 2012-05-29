 /*
  * jQuery Plugin - Inline content reader
  */

(function($) {

   // Delete any existing reader when executing plugin.
   $.reader = {};

   // Plugin defined as a JQuery function
   $.fn.reader = function(options) {

      // Merge options passed with settings
      // Default settings defined at the bottom
      var opts = $.extend({}, $.fn.reader.settings, options);

      // Define console.log() if doesn't exist (IE)
      if (!window.console) {
         window.console = {};
         window.console.log = function (text) { };
      }

      // Reader object does all the heavy lifting.
      var reader = {

         // All pages available to the reader
         pages: [],
         // Fames used to pre-load content: current, 1 prev, 1 next
         frames_count: 3,
         // Current pages index. Set to -1 so call to view_page(0) is init
         // function still loads first page
         current_page: -1,
         // Current frame index
         current_frame: 0,
         // Plugin options
         opts: opts,

         // Init current page and current frame based on page index to view.
         // This function also calculate previous and next pages and load
         // them on the appropriate frame
         // TODO: Enable init via a page URL
         view_page: function(index) {

            // If page reuqested to view is current page, nothing to do.
            if ( parseInt(index) == parseInt(this.current_page) ) {
               console.log('Page requested is current page. Nothing to do.');
               return;
            }

            // Init current page and current frame
            this.current_page = index;
            this.current_frame = 0;

            // Calculate prev and next pages
            var prev_page = (this.current_page + ( this.pages.length - 1) ) % this.pages.length;
            var next_page = (this.current_page + ( this.pages.length + 1)) % this.pages.length;
            // Calculate prev and next frames
            var prev_frame = (this.current_frame + ( this.frames_count - 1) ) % this.frames_count;
            var next_frame = (this.current_frame + ( this.frames_count + 1) ) % this.frames_count;

            // Load and show current page
            console.log('Loading '+this.pages[this.current_page]+' in frame '+this.current_frame);
            this._load_page_content(this.pages[this.current_page], this.current_frame);
            $('#'+this.opts.inline_reader+' div#alt_page_'+this.current_frame).show();
            $('#'+this.opts.inline_reader+' iframe#page_'+this.current_frame).css("display", "none");

            // Load previous page, do not show it
            console.log('Loading '+this.pages[prev_page]+' in frame '+prev_frame);
            this._load_page_content(this.pages[prev_page], prev_frame);
            $('#'+this.opts.inline_reader+' div#alt_page_'+prev_frame).hide();
            $('#'+this.opts.inline_reader+' iframe#page_'+prev_frame).css("display", "none");

            // Load next page, do not show it
            console.log('Loading '+this.pages[next_page]+' in frame '+next_frame);
            this._load_page_content(this.pages[next_page], next_frame);
            $('#'+this.opts.inline_reader+' div#alt_page_'+next_frame).hide();
            $('#'+this.opts.inline_reader+' iframe#page_'+next_frame).css("display", "none");

         }, // End function view_page()

         // Shfit page and frame forward or backward based on offset.
         // Offset should be +1/-1
         // Other values (+n/-n) might work but have not been tested
         // In the context of this function 'next' means next in the direction
         // we are going, either forward or backward.
         // In this function 'new' referes to pages/frames after the shift and
         // 'old' referes to pages/frames before the shift.
         _shift: function(offset) {

            console.log('_shift()');
            console.log('Current frame: '+this.current_frame);
            console.log('Current page: '+this.current_page);
            console.log('Current URL: '+this.pages[this.current_page]);
            console.log('Offset: '+offset);

            // Hide all alt_pages
            console.log('Hiding all alt pages');
            $('.alt_page').hide();

            // Find next frame. The "new current" frame.
            // This is the one to show. Should ben already loaded
            var new_current_frame = (this.current_frame + (this.frames_count + offset) ) % this.frames_count;
            console.log('Next frame: '+new_current_frame);

            // Hide current frame
            console.log('Hidding current frame: '+this.current_frame);
            $('#'+this.opts.inline_reader+' iframe#page_'+this.current_frame).css("display", "none");

            // Show next frame or next alt page if frame not loaded
            var loaded = $('#'+this.opts.inline_reader+' iframe#page_'+new_current_frame).attr("loaded");
            var source = $('#'+this.opts.inline_reader+' iframe#page_'+new_current_frame).attr("source");
            if ( loaded && source != '_twitter-status_' && source != '_facebook-status_' ) {
               $('#'+this.opts.inline_reader+' iframe#page_'+new_current_frame).css("display", "block");
            }
            else {
               $('#'+this.opts.inline_reader+' div#alt_page_'+new_current_frame).show();
            }

            // Compute new current page
            var new_current_page = (this.current_page + ( this.pages.length + offset) ) % this.pages.length;
            console.log('Current page after shift (new): '+new_current_page);
            console.log('Current URL after shift (new): '+this.pages[new_current_page]);
            // Compute new next page
            var new_next_page = (new_current_page + ( this.pages.length + offset) ) % this.pages.length;
            console.log('Next page after shift: '+new_next_page);

            // Update dialog title
            var page_url_link = '<a target="_blank" href="' +
                  this.pages[new_current_page] + '">' + this.pages[new_current_page] + '</a>';
            $('.reader_nav_link').html(page_url_link);

            // Old previous frame needs to become the future next frame - Load its content
            var old_prev_frame = (this.current_frame + ( this.frames_count - offset) ) % this.frames_count;
            console.log('Updating frame: '+old_prev_frame);
            // Setting loading content and showing alt page for next frame
            console.log('Updating alt page: '+old_prev_frame);
            console.log('Loading URL: '+this.pages[new_next_page]);

            $('#'+this.opts.inline_reader+' iframe#page_'+old_prev_frame).css("display", "none");
            var p = this.pages[new_next_page];
            this._load_page_content(p, old_prev_frame);

            // Shift frame & page
            this.current_page  = new_current_page;
            this.current_frame = new_current_frame;

         }, // End function _shift()

         _load_page_content: function(url, frame_index) {
            var markup = '';
            if ( /twitter.com.+status.+/.test(url) ) {
               markup = '<div style="margin-left: auto; margin-right: auto;">' +
                  '<blockquote class="twitter-tweet">' +
                  '<p>&nbsp;</p>' +
                  '<a href="'+url+'"></a>' +
                  '</blockquote>' +
                  '</div>' +
                  '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';
               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).removeAttr("loaded");
               //$('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("src", "javascript:void(0);");
               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("source", "_twitter-status_");
            }
//            else if ( /facebook.com/.test(url) ) {
//               markup = '<b>Facebook content can not be loaded here. Click link to read.</b><br/><br/>' +
//                  '<a target="_blank" href="'+url+'">'+url+'</a>';
//               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).removeAttr("loaded");
//               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("src", "");
//               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("source", "_facebook-status_");
//            }
            else {
               markup = '<span class="content_loading">Loading: '+url+'</span>';
               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).removeAttr("loaded");
               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("src", url);
               $('#'+this.opts.inline_reader+' iframe#page_'+frame_index).attr("source", "url");
            }
            $('#'+this.opts.inline_reader+' div#alt_page_'+frame_index).html(markup);
         }, // End function _load_page_content

         // Go to the next page loaded
         next: function() { this._shift(+1); }, // End function next()

         // Go to the previous page loaded
         prev: function() { this._shift(-1); }, // End function prev()

         // Open inline reader
         open: function() {
            // Update title
            var page_url_link = '<a target="_blank" href="' +
                  this.pages[this.current_page] + '">' + this.pages[this.current_page] + '</a>';
            $('.reader_nav_link').html(page_url_link);

            // Show next frame or next alt page if frame not loaded
            var loaded = $('#'+this.opts.inline_reader+' iframe#page_'+this.current_frame).attr("loaded");
            if ( loaded ) {
               $('#'+this.opts.inline_reader+' iframe#page_'+this.current_frame).css("display", "block");
            }
            else {
               $('#'+this.opts.inline_reader+' div#alt_page_'+this.current_frame).show();
            }

            // Open dialog
            $('#'+this.opts.inline_reader).dialog("open");
         }, // End function open()

         // Frame loaded callback
         content_loaded: function(index) {
            console.log('Frame loaded: '+index);
            $('#'+this.opts.inline_reader+' iframe#page_'+index).attr("loaded", "loaded");
            if ( this.current_frame ==  index ) {
               console.log('Frame loaded is current frame');
               var source = $('#'+this.opts.inline_reader+' iframe#page_'+source).attr("source");
               if ( source != '_twitter-status_' && source != '_facebook-status_' ) {
                  $('#'+this.opts.inline_reader+' div#alt_page_'+index).hide();
                  $('#'+this.opts.inline_reader+' iframe#page_'+index).css("display", "block");
               }
            }
         } // End function content_loaded()

      }; // End reader object

      var reader_markup =
         '<div id="'+opts.inline_reader+'" style="display: none; overflow: hidden; padding: 0px; pargin: 0px;">'+
         '   <iframe id="page_0" scrolling="auto" style="display: none;"' +
         '           frameborder="0" src="" width="100%" height="100%" onload="jQuery.reader.content_loaded(0);">' +
         '   </iframe>' +
         '   <div id="alt_page_0" class="alt_page" style="display: none; width: 100%; padding: 20px;"></div>' +
         '   <iframe id="page_1" scrolling="auto" style="display: none;"' +
         '           frameborder="0" src="" width="100%" height="100%" onload="jQuery.reader.content_loaded(1);">' +
         '   </iframe>' +
         '   <div id="alt_page_1" class="alt_page" style="display: none; width: 100%; padding: 20px;"></div>' +
         '   <iframe id="page_2" scrolling="auto" style="display: none;"' +
         '           frameborder="0" src="" width="100%" height="100%" onload="jQuery.reader.content_loaded(2);">' +
         '   </iframe>' +
         '   <div id="alt_page_2" class="alt_page" style="display: none; width: 100%;  padding: 20px;"></div>' +
      '</div>';
      var title_nav =
         '<span class="reader_header">' +
         '<span class="reader_nav" onclick="jQuery.reader.prev();">prev</span> | ' +
         '<span class="reader_nav" onclick="jQuery.reader.next();">next</span> | ' +
         '<div class="reader_nav_link"></div>' +
         '<span class="reader_nav reader_nav_close" onclick="jQuery(\'#'+opts.inline_reader+'\').dialog(\'close\');">close</span>' +
         '</span>';


      // Initialization function
      function _init() {
         console.log('_init()');

         // Size for the reader
         var h = Math.round($(window).height()*0.9);
         var w = Math.max(Math.round($(window).width()*0.8), 1100);
         console.log('Reader size (w x h): '+w+' x '+h);
         // Add reader to page
         console.log('Creating reader markup.');
         $('body').append(reader_markup);

         $('#'+opts.inline_reader).dialog({
            autoOpen: false,
            position: 'center' ,
            title: title_nav,
            closeText: '',
            dialogClass: 'inline_reader_style',
            draggable: false,
            height: h,
            width: w,
            modal: true,
            resizable: false
         });

         console.log('_init() done.');

      }; // End function _init()

      // Initialize
      console.log('Initializing');
      _init();

      // Plugin execution
      console.log('Redeable elements count: '+this.length);
      this.each( function() {

         // Add link to pages list
         console.log('Adding page URL to reader: '+$(this).attr('href'));
         reader.pages.push($(this).attr('href'));
         // Highjack click
         $(this).click(function() {
            console.log('Pages loaded: '+reader.pages);
            console.log('Looking for index for: '+$(this).attr('href'));
            console.log('Index: '+reader.pages.indexOf($(this).attr('href')));
            var page_index = reader.pages.indexOf($(this).attr('href'));
            reader.view_page(page_index);
            reader.open();
            // Prevent link from opening
            return false;
         });

      }); // End plugin return execution

      // Load first page, this 3 pages
      console.log('Loading initial page');
      reader.view_page(0);

      // Create static access to reader object
      $.reader = reader;

      // return functions to navidate in reader
      return reader;

   }; // End $.fn.reader()


   // Default setting
   $.fn.reader.settings = {

      // class for the reader dialog
      inline_reader: 'inline_reader'

   } // End default settings


})( jQuery );
