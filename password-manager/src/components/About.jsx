import { motion } from 'framer-motion'

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Protecting Your Digital Identity Since 2020
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              At SecurePass, we believe that everyone deserves peace of mind when it comes to their digital security. 
              Our mission is to make password management simple, secure, and accessible to everyone.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Our Mission</h3>
                <p className="mt-2 text-base text-gray-600">
                  To provide the most secure and user-friendly password management solution that helps people protect their digital lives.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Our Vision</h3>
                <p className="mt-2 text-base text-gray-600">
                  A world where everyone can safely navigate their digital life without the worry of compromised accounts or forgotten passwords.
                </p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="text-4xl font-bold text-indigo-600">1M+</h4>
                <p className="mt-2 text-gray-600">Active Users</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-indigo-600">99.9%</h4>
                <p className="mt-2 text-gray-600">Uptime</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-indigo-600">24/7</h4>
                <p className="mt-2 text-gray-600">Support</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <img
                className="rounded-lg shadow-xl"
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80"
                alt="Our team"
              />
              <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply opacity-10 rounded-lg"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About 