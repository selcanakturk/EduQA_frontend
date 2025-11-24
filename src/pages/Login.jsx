import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 rounded-3xl bg-white/90 p-8 shadow-lg md:grid-cols-2">
      <div className="flex flex-col justify-center">
        <p className="text-sm uppercase tracking-wide text-blue-500">
          EduQA Campus
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Topluluğa geri dön!
        </h1>
        <p className="mt-4 text-gray-600">
          Derslere dair sorularını sor, tartışmalara katıl ve en iyi cevapları
          takip et. Hesabın yoksa hemen{" "}
          <Link to="/register" className="text-blue-600 underline">
            kayıt ol
          </Link>
          .
        </p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <LoginForm variant="page" />
        <p className="mt-4 text-center text-sm text-gray-500">
          Sorun yaşarsan öğrenci işleriyle iletişime geçebilirsin.
        </p>
      </div>
    </div>
  );
}