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

    // ### TODO: principal copy in canvas_renderer.js
    this.show_association = function(assoc, do_select) {
        // update viewmodel
        var assoc_viewmodel = topicmap.add_association(assoc)
        if (do_select) {
            topicmap.set_association_selection(assoc.id)
        }
        // update view
        if (assoc_viewmodel) {
            d3_view.show_association(assoc_viewmodel)
        }
        if (do_select) {
            d3_view.set_association_selection(assoc.id)
        }
    }

    // ---

    // ### TODO: principal copy in canvas_renderer.js
    this.delete_topic = function(topic_id) {
        // update viewmodel
        for_all_topicmaps("delete_topic", topic_id)
        // update view
        d3_view.remove_topic(topic_id)
    }

    // ---

    // ### TODO: copy in canvas_renderer.js
    this.is_topic_visible = function(topic_id) {
        var topic = topicmap.get_topic(topic_id)
        return topic && topic.visibility
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

    // ### TODO: principal copy in canvas_renderer.js
    this.select_association = function(assoc_id) {
        // fetch from DB
        var assoc = dm4c.fetch_association(assoc_id)
        // update viewmodel
        topicmap.set_association_selection(assoc_id)
        // update view
        d3_view.set_association_selection(assoc_id)
        //
        return assoc
    }

    // ---

    this.begin_association = function(topic_id, x, y) {
        d3_view.begin_association(topic_id, x, y)
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

    // ----------------------------------------------------------------------------------------------- Private Functions

    /**
     * Iterates through all topicmaps and calls the given function with the given argument on them.
     * Returns the function call's return value for the topicmap that is currently displayed.
     *
     * ### TODO: updating *all* topicmaps should not be the responsibility of the topicmap renderer.
     * ### TODO: copy in canvas_renderer.js
     */
    function for_all_topicmaps(topicmap_func, arg) {
        var return_value
        dm4c.get_plugin("de.deepamehta.topicmaps").iterate_topicmaps(function(_topicmap) {
            var ret = _topicmap[topicmap_func](arg)
            if (topicmap.get_id() == _topicmap.get_id()) {
                return_value = ret
            }
        })
        return return_value
    }
}
