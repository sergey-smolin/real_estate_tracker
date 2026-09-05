const STORAGE_KEY = "estateTrackProperties";

const defaultProperties = [
  {
    id: crypto.randomUUID(),
    name: "Maple Street Apartment",
    location: "Austin, TX",
    price: 385000,
    previousPrice: 399000,
    rent: 2550,
    status: "Potential Deal",
    bedrooms: 2,
    area: 1180,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    notes: "Close to transit and local restaurants.",
    updated: "Today"
  },
  {
    id: crypto.randomUUID(),
    name: "Oak Valley House",
    location: "Denver, CO",
    price: 615000,
    previousPrice: 615000,
    rent: 3200,
    status: "Watching",
    bedrooms: 4,
    area: 2180,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
    notes: "Large backyard. Check roof condition.",
    updated: "Yesterday"
  },
  {
    id: crypto.randomUUID(),
    name: "Harbor View Condo",
    location: "Tampa, FL",
    price: 299000,
    previousPrice: 315000,
    rent: 2250,
    status: "Owned",
    bedrooms: 2,
    area: 980,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    notes: "Strong rental demand during winter season.",
    updated: "3 days ago"
  }
];

let properties = loadProperties();

const propertyGrid = document.getElementById("propertyGrid");
const emptyState = document.getElementById("emptyState");
const propertyTemplate = document.getElementById("propertyTemplate");
const modal = document.getElementById("propertyModal");
const propertyForm = document.getElementById("propertyForm");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const propertyCount = document.getElementById("propertyCount");
const portfolioValue = document.getElementById("portfolioValue");
const averageYield = document.getElementById("averageYield");
const priceReductions = document.getElementById("priceReductions");

function loadProperties() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultProperties;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProperties));
  return defaultProperties;
}

function saveProperties() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function calculateYield(property) {
  const annualRent = Number(property.rent || 0) * 12;
  const price = Number(property.price || 0);

  if (!price) return 0;

  return (annualRent / price) * 100;
}

function getPriceChange(property) {
  const current = Number(property.price || 0);
  const previous = Number(property.previousPrice || 0);

  if (!previous || current === previous) return null;

  return ((current - previous) / previous) * 100;
}

function getFilteredProperties() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  return properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm) ||
      property.location.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || property.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });
}

function updateStats() {
  const totalValue = properties.reduce(
    (total, property) => total + Number(property.price || 0),
    0
  );

  const yields = properties
    .map(calculateYield)
    .filter((value) => value > 0);

  const average =
    yields.length > 0
      ? yields.reduce((sum, value) => sum + value, 0) / yields.length
      : 0;

  const reductions = properties.filter((property) => {
    return Number(property.previousPrice) > Number(property.price);
  }).length;

  propertyCount.textContent = properties.length;
  portfolioValue.textContent = formatCurrency(totalValue);
  averageYield.textContent = `${average.toFixed(1)}%`;
  priceReductions.textContent = reductions;
}

function renderProperties() {
  propertyGrid.innerHTML = "";

  const filteredProperties = getFilteredProperties();

  if (filteredProperties.length === 0) {
    emptyState.classList.remove("hidden");
    updateStats();
    return;
  }

  emptyState.classList.add("hidden");

  filteredProperties.forEach((property) => {
    const card = propertyTemplate.content.cloneNode(true);

    const image = card.querySelector(".card-image");
    const statusBadge = card.querySelector(".status-badge");
    const menuButton = card.querySelector(".menu-button");
    const location = card.querySelector(".property-location");
    const name = card.querySelector(".property-name");
    const price = card.querySelector(".property-price");
    const priceChange = card.querySelector(".price-change");
    const bedroomDetail = card.querySelector(".bedroom-detail");
    const areaDetail = card.querySelector(".area-detail");
    const yieldDetail = card.querySelector(".yield-detail");
    const updatedDate = card.querySelector(".updated-date");
    const editButton = card.querySelector(".edit-button");

    image.src =
      property.image ||
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";

    image.alt = property.name;
    image.onerror = () => {
      image.src =
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80";
    };

    statusBadge.textContent = property.status;
    location.textContent = property.location;
    name.textContent = property.name;
    price.textContent = formatCurrency(property.price);

    const change = getPriceChange(property);

    if (change === null) {
      priceChange.textContent = "No change";
      priceChange.classList.remove("negative");
    } else if (change < 0) {
      priceChange.textContent = `${Math.abs(change).toFixed(1)}% lower`;
      priceChange.classList.remove("negative");
    } else {
      priceChange.textContent = `+${change.toFixed(1)}%`;
      priceChange.classList.add("negative");
    }

    bedroomDetail.textContent = property.bedrooms
      ? `${property.bedrooms} beds`
      : "Beds n/a";

    areaDetail.textContent = property.area
      ? `${formatNumber(property.area)} sq ft`
      : "Area n/a";

    yieldDetail.textContent = property.rent
      ? `${calculateYield(property).toFixed(1)}% yield`
      : "Yield n/a";

    updatedDate.textContent = `Updated ${property.updated || "today"}`;

    editButton.addEventListener("click", () => openEditModal(property.id));

    menuButton.addEventListener("click", () => {
      const confirmed = confirm(
        `Delete "${property.name}" from your portfolio?`
      );

      if (confirmed) {
        properties = properties.filter((item) => item.id !== property.id);
        saveProperties();
        renderProperties();
      }
    });

    propertyGrid.appendChild(card);
  });

  updateStats();
}

function openAddModal() {
  propertyForm.reset();
  document.getElementById("propertyId").value = "";
  document.getElementById("modalTitle").textContent = "Add property";
  modal.classList.remove("hidden");
  document.getElementById("propertyName").focus();
}

function openEditModal(id) {
  const property = properties.find((item) => item.id === id);

  if (!property) return;

  document.getElementById("propertyId").value = property.id;
  document.getElementById("propertyName").value = property.name;
  document.getElementById("propertyLocation").value = property.location;
  document.getElementById("propertyPrice").value = property.price;
  document.getElementById("propertyPreviousPrice").value =
    property.previousPrice || "";
  document.getElementById("propertyRent").value = property.rent || "";
  document.getElementById("propertyStatus").value = property.status;
  document.getElementById("propertyBedrooms").value = property.bedrooms || "";
  document.getElementById("propertyArea").value = property.area || "";
  document.getElementById("propertyImage").value = property.image || "";
  document.getElementById("propertyNotes").value = property.notes || "";

  document.getElementById("modalTitle").textContent = "Edit property";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function getFormProperty() {
  return {
    id: document.getElementById("propertyId").value || crypto.randomUUID(),
    name: document.getElementById("propertyName").value.trim(),
    location: document.getElementById("propertyLocation").value.trim(),
    price: Number(document.getElementById("propertyPrice").value),
    previousPrice:
      Number(document.getElementById("propertyPreviousPrice").value) || 0,
    rent: Number(document.getElementById("propertyRent").value) || 0,
    status: document.getElementById("propertyStatus").value,
    bedrooms: Number(document.getElementById("propertyBedrooms").value) || 0,
    area: Number(document.getElementById("propertyArea").value) || 0,
    image: document.getElementById("propertyImage").value.trim(),
    notes: document.getElementById("propertyNotes").value.trim(),
    updated: "Just now"
  };
}

function exportCSV() {
  if (properties.length === 0) {
    alert("There are no properties to export.");
    return;
  }

  const headers = [
    "Property",
    "Location",
    "Price",
    "Previous Price",
    "Monthly Rent",
    "Status",
    "Bedrooms",
    "Area",
    "Rental Yield",
    "Notes"
  ];

  const rows = properties.map((property) => [
    property.name,
    property.location,
    property.price,
    property.previousPrice,
    property.rent,
    property.status,
    property.bedrooms,
    property.area,
    `${calculateYield(property).toFixed(2)}%`,
    property.notes
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "estate-track-properties.csv";
  link.click();

  URL.revokeObjectURL(url);
}

document.getElementById("openModalBtn").addEventListener("click", openAddModal);
document.getElementById("emptyAddBtn").addEventListener("click", openAddModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);
document.getElementById("exportBtn").addEventListener("click", exportCSV);

searchInput.addEventListener("input", renderProperties);
statusFilter.addEventListener("change", renderProperties);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

propertyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const property = getFormProperty();
  const existingIndex = properties.findIndex(
    (item) => item.id === property.id
  );

  if (existingIndex >= 0) {
    properties[existingIndex] = property;
  } else {
    properties.unshift(property);
  }

  saveProperties();
  renderProperties();
  closeModal();
});

renderProperties();
