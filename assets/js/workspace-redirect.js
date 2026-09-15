location.replace(
  location.hash === "#saved"
    ? "saved.html"
    : location.hash === "#chat"
      ? "chat.html"
      : "plan.html",
);
