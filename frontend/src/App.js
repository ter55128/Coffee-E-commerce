import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthService from "./services/auth-service";
import { CartProvider } from "./context/CartContext";

import Layout from "./components/Layout";
import HomeComponent from "./components/home-component";
import LoginComponent from "./components/login-component";
import RegisterComponent from "./components/register-component";
import ForgotPasswordComponent from "./components/forgotPassword-component";
import ResetPasswordComponent from "./components/resetPassword-component";
import NotFound from "./components/NotFound";
import KnowledgeComponent from "./components/knowledge-component";
import PublicProfileComponent from "./components/publicProfile-component";

import ProductsComponent from "./components/products-component";
import ProductDetailComponent from "./components/productDetail-component";

import ArticlesComponent from "./components/articles-component";
import ArticleDetailComponent from "./components/articleDetail-component";
import EditArticleComponent from "./components/editArticle-component";
import PostArticleComponent from "./components/postArticle-component";

import ProfileComponent from "./components/profile-component";
import EditProfileComponent from "./components/editProfile-component";

import StoreProductsComponent from "./components/storeProducts-component";
import EditProductComponent from "./components/editProduct-component";
import PostProductComponent from "./components/postProduct-component";

import CartComponent from "./components/cart-component";
import PaymentReturn from "./components/PaymentReturn";

function App() {
  let [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* 公開頁面 */}
          <Route
            path="/"
            element={
              <Layout
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          >
            <Route
              index
              element={
                <HomeComponent
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              }
            />
            <Route path="/register" element={<RegisterComponent />} />
            <Route
              path="/login"
              element={
                <LoginComponent
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              }
            />
            <Route
              path="/forgot-password"
              element={<ForgotPasswordComponent />}
            />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordComponent />}
            />
            <Route path="/knowledge" element={<KnowledgeComponent />} />
            <Route
              path="/publicProfile/:id"
              element={<PublicProfileComponent />}
            />

            {/* 商品相關 */}
            <Route path="products">
              <Route
                index
                element={
                  <ProductsComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path=":beanId"
                element={
                  <ProductDetailComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
            </Route>

            {/* 文章相關路由 */}
            <Route path="articles">
              <Route
                index
                element={
                  <ArticlesComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path=":id"
                element={
                  <ArticleDetailComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="edit/:id"
                element={<EditArticleComponent currentUser={currentUser} />}
              />
              <Route
                path="post"
                element={
                  <PostArticleComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
            </Route>

            {/* 需要登入的路由*/}
            <Route path="profile">
              <Route
                index
                element={
                  <ProfileComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="edit"
                element={
                  <EditProfileComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
            </Route>

            <Route path="storeProducts">
              <Route
                index
                element={
                  <StoreProductsComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="post"
                element={
                  <PostProductComponent
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />
              <Route
                path="edit/:id"
                element={<EditProductComponent currentUser={currentUser} />}
              />
            </Route>

            <Route
              path="/cart"
              element={
                <CartComponent
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              }
            />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
