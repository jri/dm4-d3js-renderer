/**
 * A topicmap renderer based on D3.
 */
function D3Renderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    js.extend(this, TopicmapRenderer)

    this.dom = $("<div>")

    // Viewmodel
    var topicmap    // the topicmap currently rendered (a TopicmapViewmodel). Initialized by display_topicmap().

    // View
    var d3_view = new D3View()

    // ------------------------------------------------------------------------------------------------------ Public API



    // === TopicmapRenderer Implementation ===

    this.get_info = function() {
        return {
            uri: "dm4.d3js_renderer",
            name: "Topicmap (with force)"
        }
    }

    // ---

    this.load_topicmap = function(topicmap_id, config) {
        config.customizers = []
        return new TopicmapViewmodel(topicmap_id, config)
    }

    this.display_topicmap = function(topicmap_viewmodel, no_history_update) {
        topicmap = topicmap_viewmodel
        d3_view.display_topicmap(topicmap)
    }

    // ---

    // ### TODO: principal copy in canvas_renderer.js
    this.show_topic = function(topic, do_select) {
        d3_view.init_topic_position(topic)
        // update viewmodel
        var topic_viewmodel = topicmap.add_topic(topic, topic.x, topic.y)
        if (do_select) {
            topicmap.set_topic_selection(topic.id)
        }
        // update view
        if (topic_viewmodel) {
            d3_view.show_topic(topic_viewmodel)
        }
        if (do_select) {
            d3_view.set_topic_selection(topic.id)
        }
        //
        return topic
    }

    // ---

    // ### TODO: principal copy in canvas_renderer.js
    this.select_topic = function(topic_id) {
        // fetch from DB
        var topic = dm4c.fetch_topic(topic_id)
        // update viewmodel
        topicmap.set_topic_selection(topic_id)
        // update view
        d3_view.set_topic_selection(topic_id)
        //
        return {select: topic, display: topic}
    }



    // === Left SplitPanel Component Implementation ===

    this.init = function() {
        d3_view.init()
    }

    /**
     * Called in 3 situations:
     * 1) Initialization: the topicmap renderer is added to the split panel.
     * 2) The user resizes the main window.
     * 3) The user moves the split panel's slider.
     */
    this.resize = function(size) {
        d3_view.resize(size)
    }
}
