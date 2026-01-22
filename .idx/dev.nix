{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
  ];
  idx.extensions = [
    
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm",
          "run",
          "dev",
          "--",
          "--port",
          "$PORT"
        ];
        manager = "web";
      };
      api = {
        command = ["npm", "run", "api:dev"];
      };
    };
  };
}
