import { updateAuthUI } from '../components/Header.js';

export class AuthPresenter {
  constructor(authModel, authView, router) {
    this.authModel = authModel;
    this.authView = authView;
    this.router = router;

    // Initialize UI state
    updateAuthUI(this.authModel.isAuthenticated());

    if (authView.bindLogin) {
      authView.bindLogin(this.handleLogin.bind(this));
    }

    if (authView.bindRegister) {
      authView.bindRegister(this.handleRegister.bind(this));
    }
  }

  async handleLogin(email, password) {
    try {
      const result = await this.authModel.login(email, password);
      
      if (result.success) {
        await this.router.navigateTo("/stories");
        updateAuthUI(true); 
      } else {
        this.authView.showError?.(result.message);
      }
    } catch (error) {
      this.authView.showError?.(error.message);
    }
  }

  async handleRegister(name, email, password) {
    try {
      const result = await this.authModel.register(name, email, password);
      
      if (result.success) {
        this.authView.showSuccess?.("Registration successful. Please login.");
        this.router.navigateTo("/login");
      } else {
        this.authView.showError?.(result.message);
      }
    } catch (error) {
      this.authView.showError?.(error.message);
    }
  }

  handleLogout() {
    this.authModel.logout();
    updateAuthUI(false); // Updated this line
    this.router.navigateTo("/login");
  }
}