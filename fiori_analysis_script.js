console.log("from fiori_analysis_script");

// SC analysis - start

// Check if application has global elements

function global_check() {
  console.log("global_check called");
  if (document.querySelectorAll("header[id=\"shell-header\"][class*=\"Header\"],[id*=\"shell\"][id*=\"Popover\"]:not([id*=\"VisualizationOrganizer\"])[role=\"dialog\"][style*=\"block\"]").length > 0) {
    console.log("Application has global elements");
    return true;
  } else {
    console.log("Application doesn't contain global elements");
    return false;
  }
}

// Check if application has popup elements

function popup_check() {
  if (document.querySelectorAll("[class*=\"Dialog\"][role*=\"dialog\"],[id*=\"shell\"][id*=\"Popover\"]:has([id*=\"VisualizationOrganizer\"])[role=\"dialog\"][style*=\"block\"]").length > 0 || document.querySelectorAll("[id*=\"Popup\"]>[class*=\"Popup\"][class*=\"Window\"]").length > 0) {
    console.log("Application has identifiable popups")
    return true;
  } else {
    console.log("Application doesn't contain identifiable popups")
    return false;
  }
}

// Check if application has page elements, and if it supports identifying them

var alphanum_regex = /^[a-z0-9]+$/gi;

function is_cross_domain_iframe(iframe) {
  try {
    return Boolean(iframe.contentDocument);
  } catch (e) {
    return false;
  }
}

function page_check() {
  var page_check_score = 0;

  // Check the top
  if (!document.querySelectorAll("[id=\"viewPortContainer\"],[id*=\"popover\"][style*=\"visible\"]:not([style*=\"hidden\"])")) {
    console.log("Application doesn't contain identifiable page element")
    return false;
  } else if (document.querySelectorAll("[id=\"viewPortContainer\"],[id*=\"popover\"][style*=\"visible\"]:not([style*=\"hidden\"])").length > 0) {
    console.log("Application contains identifiable page element");

    page_check_score = page_check_score + 1;

    if (location.search.includes('pageId') || location.search.includes('workplaceId') || !(alphanum_regex.test(location.hash))) {
      page_check_score = page_check_score + 1;
    }

    // check the same for iframe upto 1 level
    if (document.querySelectorAll('iframe:not([id*="wfx"])').length > 0) {
      document.querySelectorAll('iframe:not([id*="wfx"])').forEach(function (e, index) {
        if (is_cross_domain_iframe(e)) {
          console.log("Not, a cross domain iframe, can access it");

          if (e.contentWindow.document.querySelectorAll("[id*=\"Page\"][ct*=\"PAGE\"] [id*=\"PageLayout\"]")) {
            page_check_score = page_check_score + 1;

            if (alphanum_regex.test(e.contentWindow.location.hash)) {
              page_check_score = page_check_score + 1;
            }
          } else if (e.contentWindow.document.querySelectorAll("[id*=\"com.sap\"][class*=\"ComponentContainer\"],[class*=\"ComponentContainer\"] [id*=\"content-uiarea\"]")) {
            page_check_score = page_check_score + 1;

            if (e.contentWindow.document.querySelector("[id*=\"com.sap\"][class*=\"ComponentContainer\"]").hasAttribute('id')) {
              page_check_score = page_check_score + 1;
            } else {
              if (alphanum_regex.test(e.contentWindow.location.hash)) {
                page_check_score = page_check_score + 1;
              }
            }
          }

        }
      });
    } else {
      console.log("Application doesn't contain iframe element/elements");
    }

    return page_check_score;
  }

}

// Check if application has sub-global/tab elements, and if it supports identifying them

function sub_global_tabs_check() {
  if (document.querySelectorAll("[id*=\"navigationBar\"]:not([class*=\"Hidden\"])").length > 0) {
    console.log("Application has identifiable sub-global/tabs")
    return true;
  } else {
    console.log("Application doesn't contain identifiable sub-global/tabs")
    return false;
  }
}

function compute_sc_score() {
  console.log("compute_sc_score called");
  var score_for_sc_and_finder = 0;

  if (global_check()) {
    score_for_sc_and_finder = score_for_sc_and_finder + 2;
  }

  if (popup_check()) {
    score_for_sc_and_finder = score_for_sc_and_finder + 2;
  }

  if (sub_global_tabs_check()) {
    score_for_sc_and_finder = score_for_sc_and_finder + 2;
  }

  if (page_check()) {
    score_for_sc_and_finder = score_for_sc_and_finder + page_check();
  }

  console.log("score_for_sc_and_finder on this page: ", score_for_sc_and_finder);

  return score_for_sc_and_finder;
}

// SC analysis - end


// Finder - start

function compute_finder_score() {
  console.log("compute_finder_score called");

  if (
    document.querySelectorAll("button[id]").length > 0 ||
    document.querySelectorAll("[class*=\"TileWrapper\"] a[href*=\"emearegional\"][href]") ||
    document.querySelectorAll("[class*=\"LayoutItem\"] div[class*=\"Cell\"]>[class*=\"InputBase\"][id]") ||
    document.querySelectorAll("button[id*=\"btn\"][id],td>div[id*=\"application\"][id]") ||
    document.querySelectorAll("div[class*=\"InputBase\"][id]:not([id*=\"content\"])[id]") ||
    document.querySelectorAll("li[role=\"listitem\"][id]") ||
    document.querySelectorAll("[class*=\"Cell\"]>label[id][for],[class*=\"FormElement\"]>label[for]")
  ) {
    console.log("returning true for finder");
    return true;
  } else {
    console.log("returning false for finder");
    return false;
  }
}

// Finder - end


// UUID - start

function compute_uuid_score() {
  console.log("compute_uuid_score called");

  if (document.querySelector('[id*="shell-header"] [id*="userActionsMenuHeaderButton"][title]')) {
    console.log("returning true for UUID");
    return true;
  } else {
    console.log("returning false for UUID");
    return false;
  }
}

// UUID - end


// Get compatibility score on current page - start

function compatibility_init() {
  console.log("compatibility_init called");

  var compatibility_score = 0;

  if (compute_sc_score()) {
    compatibility_score = compatibility_score + compute_sc_score()
  }

  if (compute_finder_score()) {
    compatibility_score = compatibility_score + 5;
  }

  if (compute_uuid_score()) {
    compatibility_score = compatibility_score + 5;
  }

  console.log("The final compatibility on this page is: ", compatibility_score);

  return compatibility_score;
}
