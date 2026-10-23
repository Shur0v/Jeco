"use client";
import { useState } from "react";
import {
  ArrowDown,
  BookOpen,
  CheckCircle2,
  ArrowUpRight,
  Link2,
} from "lucide-react";
import { Panel, SearchBox } from "./admin-shared";
const topics = [
  {
    id: "products",
    title: "Create & publish a product",
    intro: "From a new idea to a shoppable piece, with every detail connected.",
    steps: [
      [
        "Start a draft",
        "Open Products → Add product. A permanent product ID is created for click reporting, orders and inventory. Save as draft while you work.",
      ],
      [
        "Tell its story",
        "Add a name, unique URL slug, description, material and care instructions. Set the category and optional subcategory.",
      ],
      [
        "Upload photography",
        "Choose JPG, PNG or WebP images up to 5 MB. Put your cover image first, add descriptions and reorder with the arrow controls.",
      ],
      [
        "Set variants & pricing",
        "Give every finish/size a unique SKU, BDT price and stock quantity. An optional original price must exceed the sale price. Add cost to support margin estimates.",
      ],
      [
        "Choose where it appears",
        "Tick Featured, New arrival or Best seller. Homepage automatic product rows use these flags. Manual rows use their selected product IDs instead.",
      ],
      [
        "Preview, then publish",
        "Use Preview to check the card. Select Published and Save product. Open the product URL and refresh it to verify your local storefront record.",
      ],
      [
        "Edit or remove later",
        "Find the piece by name, ID or SKU. Duplicate creates a new draft with new IDs. Delete asks for confirmation; order-linked products are archived so history stays intact.",
      ],
    ],
  },
  {
    id: "categories",
    title: "Categories, subcategories & menus",
    intro: "Organize your catalog without breaking product relationships.",
    steps: [
      [
        "Create a category",
        "Open Category tree → Add category. Give it a clear name and unique slug. This becomes its collection destination.",
      ],
      [
        "Connect a subcategory",
        "Select a parent in the settings panel, or drag a leaf card onto a parent. Two levels keep your shop easy to navigate.",
      ],
      [
        "Assign products",
        "Open Products and select the category, then subcategory. Reassign products there when changing your taxonomy; category editing never moves them silently.",
      ],
      [
        "Connect navigation",
        "Use Connect as storefront menu, or add a menu entry. Select its destination and parent menu to build desktop dropdowns and mobile nested links.",
      ],
      [
        "Preview & publish",
        "Inspect desktop and mobile previews. Check names, destinations, order and promotional images, then publish the connections.",
      ],
      [
        "Remove safely",
        "A category cannot be removed while products—including draft and archived products—reference it. A three-second alert explains why; click it to open the first linked product.",
      ],
      [
        "Resolve remaining links",
        "Move all linked products, move/remove child categories, and reassign/remove menu destinations. Then delete the empty category and publish.",
      ],
    ],
  },
  {
    id: "homepage",
    title: "Refresh your homepage",
    intro: "Edit the real page layout with a clear publishing step.",
    steps: [
      [
        "Select the section",
        "Open Homepage. Hover an image and choose Edit, or choose its section in the settings panel. Touch devices keep edit buttons visible.",
      ],
      [
        "Replace media",
        "Upload an image or MP4. Set mobile artwork, alternative text, and a poster for video. Your original layout is preserved.",
      ],
      [
        "Build a slider",
        "In the hero, add slides, reorder them, or remove a slide. Gallery images can also be replaced individually.",
      ],
      [
        "Set product rows",
        "Choose automatic flag-based selection or manually select products. New arrivals and best sellers remain independently editable.",
      ],
      [
        "Tune the marquee",
        "Edit one message per line, speed and direction. The loop pauses on hover or keyboard focus; reduced-motion users see static content.",
      ],
      [
        "Review before publishing",
        "Switch between desktop and mobile canvases. Reset discards unpublished work. Publishing updates this browser’s storefront.",
      ],
      [
        "Keep content fresh",
        "Set weekly, monthly or custom review intervals. Overview highlights sections that need attention. Review reminders do not publish automatically.",
      ],
    ],
  },
  {
    id: "payments",
    title: "Orders, payments & returns",
    intro: "Follow the money separately from delivery.",
    steps: [
      [
        "Review an order",
        "Orders show customer, items, prices and separate payment/fulfillment states. Open one to see delivery and activity details.",
      ],
      [
        "Inspect its payment",
        "Payments supports bKash and Nagad demo transactions. Successful payments count as received; pending, failed and cancelled payments do not.",
      ],
      [
        "Prepare delivery",
        "Move fulfillment through unfulfilled, processing, shipped and delivered. Save the courier and tracking reference.",
      ],
      [
        "Handle a return",
        "Mark a return requested, approve it, then resolve it. Returning a product does not automatically refund or restock it.",
      ],
      [
        "Simulate a refund",
        "Enter an amount up to the remaining paid balance. Partial refunds and full refunds reduce net collections while retaining the original transaction history.",
      ],
      [
        "Restock explicitly",
        "After inspection, use the restock action once. It restores the order’s stock quantities and records an inventory adjustment.",
      ],
      [
        "Reconcile & export",
        "Filter by provider and status. Compare received, refunded and net totals, then export your BDT report. Legacy USD orders stay separate.",
      ],
    ],
  },
  {
    id: "inventory",
    title: "Inventory & availability",
    intro: "Track each finish and size, not just the product title.",
    steps: [
      [
        "Find the SKU",
        "Open Inventory and search by product name, product ID or SKU. Filter to low stock or sold out.",
      ],
      [
        "Count the available units",
        "Stock belongs to each variant. Zero stock disables availability. Positive quantities enable the variant unless the product is unpublished.",
      ],
      [
        "Record an adjustment",
        "Enter the new quantity and a reason such as restock, damage or correction. Save to record before/after quantities and time.",
      ],
      [
        "Set an alert threshold",
        "Set the low-stock threshold in the product editor. Alerts guide you to variants that need replenishment.",
      ],
      [
        "Checkout updates once",
        "A successful demo checkout checks current stock and deducts quantities once per order ID. A repeated submission must not reduce stock again.",
      ],
    ],
  },
  {
    id: "statistics",
    title: "Understand your statistics",
    intro: "Discover what shoppers explore and where they take action.",
    steps: [
      [
        "Choose the dataset",
        "Observed shows storefront activity from this browser only. Sample week illustrates a populated chart and never changes actual figures.",
      ],
      [
        "Choose a period",
        "Use today, seven days, thirty days or a custom range. Daily totals include zero-activity days and use Asia/Dhaka dates.",
      ],
      [
        "Read the chart",
        "Hover or focus a bar to see its daily count. Page views and click events are separate metrics.",
      ],
      [
        "Explore popular products",
        "The ranking shows image, name, permanent ID and clicks. Select a product to inspect views and add-to-bag actions, or open its editor.",
      ],
      [
        "Inspect events",
        "The recent event table explains page, interaction and product ID. Admin clicks, input values and sensitive details are not recorded.",
      ],
      [
        "Export your findings",
        "Export the filtered events. Real cross-visitor analytics needs a shared backend in the production phase.",
      ],
    ],
  },
  {
    id: "discounts",
    title: "Discounts & festival campaigns",
    intro: "Create targeted offers with an accurate navigation preview.",
    steps: [
      [
        "Create a code",
        "Choose percentage or fixed BDT discount, minimum spend, schedule and optional usage limit. Select eligible products/categories or leave unrestricted.",
      ],
      [
        "Save the offer",
        "Activate the code and save. Checkout validates dates, scope, usage count and minimum spend before applying it.",
      ],
      [
        "Design the campaign",
        "Set the banner text, destination, display mode and layout. Adjust height from 28 to 52 px, up to 12 px above the 40 px base.",
      ],
      [
        "Choose the finishing touches",
        "Enter hex colors or open the picker. Close cancels its temporary shade; Select applies it. A PNG/JPG background stays clipped inside the banner.",
      ],
      [
        "Test hover behavior",
        "The preview shows navigation and the offer only. In hover mode, point to or focus a menu to reveal it.",
      ],
      [
        "Publish the campaign",
        "Save campaign updates the storefront. Scheduled campaigns appear only inside their active dates; disabling the campaign hides it.",
      ],
    ],
  },
  {
    id: "customers",
    title: "Customers & store setup",
    intro: "Keep customer context useful and configuration simple.",
    steps: [
      [
        "Open a customer card",
        "Each card shows active orders and saved favourites in different colored circles. Counts reflect data available in this local preview.",
      ],
      [
        "Explore the details",
        "Use the modal’s tabs for profile, orders, delivery, payments and notes. Payment details contain references and statuses, never account credentials.",
      ],
      [
        "Keep an internal note",
        "Save preferences or service notes in the customer modal. Changes persist in this browser.",
      ],
      [
        "Configure the store",
        "Store Settings covers store name, contact, announcement, BDT shipping thresholds and available demo payment methods.",
      ],
      [
        "Understand the preview boundary",
        "Records and uploads are stored locally in IndexedDB. They are not shared across devices. Production authentication, shared storage, gateway payments and analytics require later integrations.",
      ],
    ],
  },
];
export function Documentation({
  navigate,
}: {
  navigate: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("products");
  const chosen = topics.find((t) => t.id === topic)!;
  return (
    <>
      <SearchBox
        value={query}
        onChange={setQuery}
        placeholder="Search workflows and guides"
      />
      <div className="studio-doc-topics">
        {topics
          .filter((t) =>
            (t.title + " " + t.intro + " " + t.steps.flat().join(" "))
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((t) => (
            <button
              key={t.id}
              className={topic === t.id ? "active" : ""}
              onClick={() => setTopic(t.id)}
            >
              <BookOpen size={18} />
              {t.title}
            </button>
          ))}
      </div>
      <Panel
        className="studio-workflow"
        title={chosen.title}
        action={
          <button
            className="studio-button secondary"
            onClick={() =>
              navigate(
                chosen.id === "statistics"
                  ? "statistics"
                  : chosen.id === "customers"
                    ? "customers"
                    : chosen.id,
              )
            }
          >
            Open this screen <ArrowUpRight size={16} />
          </button>
        }
      >
        <p>{chosen.intro}</p>
        <div className="studio-workflow-intro">
          <span>Start</span>
          <ArrowDown size={20} />
        </div>
        {chosen.steps.map(([title, text], i) => (
          <div className="studio-workflow-stage" key={`${chosen.id}-${i}`}>
            <div className="studio-workflow-card" tabIndex={0}>
              <span className="studio-workflow-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="studio-workflow-tip" role="tooltip">
                Step {i + 1} of {chosen.steps.length} ·{" "}
                {i === chosen.steps.length - 1
                  ? "Complete this step to finish the workflow."
                  : `Next: ${chosen.steps[i + 1][0]}`}
              </span>
            </div>
            {i < chosen.steps.length - 1 && (
              <div className="studio-workflow-connector">
                <span />
                <ArrowDown size={20} />
                <small>{i === 2 ? "Check your connections" : "Continue"}</small>
              </div>
            )}
          </div>
        ))}
        <div className="studio-workflow-done">
          <CheckCircle2 size={24} />
          <strong>You’re all set.</strong>
          <p>Return to the workspace and put this workflow into practice.</p>
        </div>
      </Panel>
    </>
  );
}
