function ProgressBar({ progress }) {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "10px",
          backgroundColor: "#76c7c0",
          transition: "width 0.3s ease-in-out",
        }}
      />
    </div>
  );
}

export { ProgressBar };
