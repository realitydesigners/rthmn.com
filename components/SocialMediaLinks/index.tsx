import Link from 'next/link';
import { IconType } from 'react-icons';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const socialMediaLinks: { icon: IconType; href: string }[] = [
  { icon: FaDiscord, href: "#" },
  { icon: FaInstagram, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaYoutube, href: "#" },
];

export function SocialMediaLinks() {
  return (
    <div className="mt-12 flex justify-center space-x-8">
      {socialMediaLinks.map((social, index) => (
        <Link
          key={index}
          href={social.href}
          className="text-gray-400 transition-colors duration-200 hover:text-white"
        >
          <social.icon size={32} />
        </Link>
      ))}
    </div>
  );
}
